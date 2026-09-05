export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Техническая записка к предварительному решению.
 *
 * POST { ...NoteInput } → { ok, source: "ai" | "template", text, model? }
 *
 * Если в Vercel задан ANTHROPIC_API_KEY — записку пишет модель Claude
 * по системному промпту, который запрещает выдумывать числа: она
 * получает готовый расчёт страницы и только обосновывает его.
 * Нормативная база в промпте — ҚМҚ 2.04.03-19 (взамен КМК 2.04.03-97);
 * номера пунктов модель берёт только из поля norms (kmkClausesFor),
 * которое сервер дописывает, если клиент его не передал.
 * Без ключа (или при ошибке API) возвращается детерминированный
 * шаблон из тех же данных — страница всегда получает документ.
 *
 * Переменные окружения:
 *   ANTHROPIC_API_KEY — ключ с console.anthropic.com
 *   ANTHROPIC_MODEL   — необязательно, по умолчанию claude-sonnet-5
 */

import {
  buildTemplateNote,
  isNoteInput,
  kmkClausesFor,
  noteUserPrompt,
  NOTE_SYSTEM_PROMPT,
} from "../../engineering/analysis/pro-result/note-template";
import { sessionFromRequest } from "../../../lib/session";

const API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-5";

/* простейшее ограничение частоты: не больше N запросов к ИИ в минуту с одного IP */
const hits = new Map<string, number[]>();
const LIMIT = 6;

function allowed(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 60_000);
  if (list.length >= LIMIT) return false;
  list.push(now);
  hits.set(ip, list);
  return true;
}

export async function POST(request: Request) {
  /* записку получают только вошедшие пользователи (дублирует proxy.ts) */
  if (!(await sessionFromRequest(request))) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  if (!isNoteInput(body)) {
    return Response.json({ ok: false, error: "bad input" }, { status: 400 });
  }
  /* перечень пунктов ҚМҚ 2.04.03-19 — единственные номера, на которые ИИ вправе ссылаться */
  if (!Array.isArray(body.norms) || !body.norms.length) {
    body.norms = kmkClausesFor(body.stages.map((s) => s.key));
  }

  const template = buildTemplateNote(body);
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return Response.json({ ok: true, source: "template", text: template, reason: "no key" });
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!allowed(ip)) {
    return Response.json({ ok: true, source: "template", text: template, reason: "rate limit" });
  }

  const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 50_000);

    const res = await fetch(API_URL, {
      method: "POST",
      signal: controller.signal,
      headers: {
        "content-type": "application/json",
        "x-api-key": key,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: 3500,
        temperature: 0.2,
        system: NOTE_SYSTEM_PROMPT,
        messages: [{ role: "user", content: noteUserPrompt(body) }],
      }),
    });
    clearTimeout(timer);

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error("engineering-note: API", res.status, err.slice(0, 300));
      return Response.json({ ok: true, source: "template", text: template, reason: `api ${res.status}` });
    }

    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = (data.content ?? [])
      .filter((c) => c.type === "text" && c.text)
      .map((c) => c.text)
      .join("\n")
      .trim();

    if (!text.startsWith("#") || text.length < 800) {
      return Response.json({ ok: true, source: "template", text: template, reason: "short answer" });
    }

    return Response.json({ ok: true, source: "ai", model, text });
  } catch (error) {
    console.error("engineering-note:", error);
    return Response.json({ ok: true, source: "template", text: template, reason: "fetch failed" });
  }
}
