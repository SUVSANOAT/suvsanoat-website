/**
 * ПОЯСНИТЕЛЬНАЯ ЗАПИСКА ФАЙЛОМ WORD (.docx).
 *
 *   POST { ...NoteInput, requirements?: [{no,text}], temperature?, discharge?,
 *          sourceByLabel?, lang? }  →  бинарный .docx
 *
 * Зачем отдельный маршрут: /api/engineering-note отдаёт записку текстом
 * для показа на странице, а проектировщику нужен файл, который можно
 * подшить в том и отдать заказчику. Числа и там и здесь одни и те же —
 * они приходят с клиента уже посчитанными (NoteInput), сервер ничего не
 * пересчитывает.
 *
 * Роль ИИ (только при заданном ANTHROPIC_API_KEY):
 *   1) ответ на техническое задание по пунктам — сопоставление
 *      требований документа с уже принятыми решениями;
 *   2) повествовательное изложение записки — приложение А.
 * Оба вызова необязательны и идут параллельно с общим сроком: если
 * ключа нет, вызов не удался или ответ не прошёл проверку — документ
 * всё равно собирается детерминированно, а таблица ответа на ТЗ
 * помечается как заполняемая проектировщиком вручную. Страница никогда
 * не остаётся без файла.
 *
 * Переменные окружения:
 *   ANTHROPIC_API_KEY — ключ с console.anthropic.com
 *   ANTHROPIC_MODEL   — необязательно, по умолчанию claude-sonnet-5
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import {
  buildNoteDocx,
  parseTzAnswers,
  tzAnswerUserPrompt,
  TZ_ANSWER_SYSTEM_PROMPT,
  type NoteDocxOptions,
  type NoteLang,
  type TzAnswer,
  type TzRequirement,
} from "../../engineering/analysis/pro-result/docx";
import {
  isNoteInput,
  kmkClausesFor,
  noteUserPrompt,
  NOTE_SYSTEM_PROMPT,
  type NoteInput,
} from "../../engineering/analysis/pro-result/note-template";
import { sessionFromRequest } from "../../../lib/session";

const API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-5";
/* общий срок на обращения к ИИ: маршрут обязан успеть отдать файл в пределах maxDuration */
const AI_TIMEOUT_MS = 45_000;
/* предел тела запроса: расчёт с чертёжными данными и ТЗ в него укладывается */
const MAX_BODY_BYTES = 512 * 1024;
/* предел числа пунктов ТЗ — тот же, что в разборе документа (tz-extract.ts) */
const MAX_REQUIREMENTS = 100;

/* ограничение частоты, как в /api/engineering-note: сборка документа
   дешёвая, дорог поход к модели */
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

/** латиница для имени файла: заголовок Content-Disposition ASCII-only (как в /api/drawings) */
function fileSlug(s: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
    н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya", ў: "u", қ: "q", ғ: "g", ҳ: "h",
  };
  return s
    .toLowerCase()
    .split("")
    .map((ch) => map[ch] ?? ch)
    .join("")
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

const LANGS = ["ru", "uz", "en", "zh"] as const;

/** разбор необязательных полей тела: всё, чего нет, остаётся неопределённым */
function parseOptions(raw: Record<string, unknown>): NoteDocxOptions {
  const opts: NoteDocxOptions = {};

  const lang = typeof raw.lang === "string" && (LANGS as readonly string[]).includes(raw.lang) ? (raw.lang as NoteLang) : "ru";
  opts.lang = lang;

  if (Array.isArray(raw.requirements)) {
    const reqs: TzRequirement[] = [];
    for (const r of raw.requirements.slice(0, MAX_REQUIREMENTS)) {
      if (!r || typeof r !== "object") continue;
      const o = r as Record<string, unknown>;
      const text = typeof o.text === "string" ? o.text.trim().slice(0, 600) : "";
      if (!text) continue;
      reqs.push({ no: typeof o.no === "string" ? o.no.trim().slice(0, 12) : "", text });
    }
    if (reqs.length) opts.requirements = reqs;
  }

  /* температурный режим: числа приходят из расчёта технологии, здесь
     только проверка конечности — подставлять значения по умолчанию
     нельзя, иначе в записке появится непосчитанная величина */
  const t = raw.temperature;
  if (t && typeof t === "object") {
    const o = t as Record<string, unknown>;
    const annualC = Number(o.annualC);
    const summerC = Number(o.summerC);
    const factor = Number(o.factor);
    if (Number.isFinite(annualC) && Number.isFinite(summerC) && Number.isFinite(factor)) {
      opts.temperature = { annualC, summerC, factor, winterGoverns: o.winterGoverns === true };
    }
  }

  if (typeof raw.discharge === "string" && raw.discharge.trim()) {
    opts.discharge = raw.discharge.trim().slice(0, 200);
  }
  if (typeof raw.author === "string" && raw.author.trim()) {
    opts.author = raw.author.trim().slice(0, 120);
  }

  if (raw.sourceByLabel && typeof raw.sourceByLabel === "object") {
    const map: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw.sourceByLabel as Record<string, unknown>).slice(0, 40)) {
      if (typeof v === "string" && v.trim()) map[k.slice(0, 80)] = v.trim().slice(0, 120);
    }
    if (Object.keys(map).length) opts.sourceByLabel = map;
  }

  return opts;
}

/** один обмен с моделью; текст ответа либо null — маршрут обязан пережить отказ */
async function askClaude(
  key: string,
  model: string,
  system: string,
  user: string,
  maxTokens: number,
  signal: AbortSignal
): Promise<string | null> {
  try {
    const res = await fetch(API_URL, {
      method: "POST",
      signal,
      headers: { "content-type": "application/json", "x-api-key": key, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        temperature: 0.2,
        system,
        messages: [{ role: "user", content: user }],
      }),
    });
    if (!res.ok) {
      console.error("note-docx: API", res.status, (await res.text().catch(() => "")).slice(0, 300));
      return null;
    }
    const data = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = (data.content ?? [])
      .filter((c) => c.type === "text" && c.text)
      .map((c) => c.text)
      .join("\n")
      .trim();
    return text || null;
  } catch (e) {
    console.error("note-docx: fetch", e);
    return null;
  }
}

/** ответ модели на ТЗ: JSON-массив, возможно в markdown-обрамлении */
function answersFrom(text: string | null, reqs: TzRequirement[]): TzAnswer[] {
  if (!text) return [];
  const body = text.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const start = body.indexOf("[");
  const end = body.lastIndexOf("]");
  if (start < 0 || end <= start) return [];
  try {
    return parseTzAnswers(JSON.parse(body.slice(start, end + 1)) as unknown, reqs);
  } catch {
    return [];
  }
}

export async function POST(request: Request) {
  /* записку получают только вошедшие пользователи (дублирует proxy.ts) */
  if (!(await sessionFromRequest(request))) {
    return Response.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return Response.json({ ok: false, error: "слишком большой запрос" }, { status: 413 });
  }
  const raw = await request.text().catch(() => "");
  if (raw.length > MAX_BODY_BYTES) {
    return Response.json({ ok: false, error: "слишком большой запрос" }, { status: 413 });
  }

  let body: unknown;
  try {
    body = JSON.parse(raw);
  } catch {
    return Response.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  if (!isNoteInput(body)) {
    return Response.json({ ok: false, error: "bad input" }, { status: 400 });
  }

  const input = body as NoteInput;
  /* перечень пунктов ҚМҚ 2.04.03-19 — единственные номера, на которые вправе ссылаться и записка, и модель */
  if (!Array.isArray(input.norms) || !input.norms.length) {
    input.norms = kmkClausesFor(input.stages.map((s) => s.key));
  }
  const opts = parseOptions(body as unknown as Record<string, unknown>);

  const key = process.env.ANTHROPIC_API_KEY;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  /* без ключа или при превышении частоты документ собирается шаблонно:
     проектировщик всё равно получает файл, только без сопоставления ИИ */
  const useAi = !!key && allowed(ip);
  let source: "ai" | "template" = "template";

  if (useAi && key) {
    const model = process.env.ANTHROPIC_MODEL || DEFAULT_MODEL;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), AI_TIMEOUT_MS);
    try {
      const reqs = opts.requirements ?? [];
      const [narrative, answers] = await Promise.all([
        askClaude(key, model, NOTE_SYSTEM_PROMPT, noteUserPrompt(input), 3500, controller.signal),
        reqs.length
          ? askClaude(key, model, TZ_ANSWER_SYSTEM_PROMPT, tzAnswerUserPrompt(input, reqs), 3000, controller.signal)
          : Promise.resolve(null),
      ]);
      /* короткий или неразмеченный ответ в документ не попадает */
      if (narrative && narrative.startsWith("#") && narrative.length >= 800) {
        opts.narrative = narrative;
        source = "ai";
      }
      const parsed = answersFrom(answers, reqs);
      if (parsed.length) {
        opts.answers = parsed;
        source = "ai";
      }
    } finally {
      clearTimeout(timer);
    }
  }

  try {
    const docx = buildNoteDocx(input, opts);
    /* копия в собственный ArrayBuffer — корректное тело ответа (как в /api/drawings) */
    const buffer = new ArrayBuffer(docx.byteLength);
    new Uint8Array(buffer).set(docx);
    const name = `SUVSANOAT_zapiska_${fileSlug(input.object || input.industry) || "obj"}_${Math.round(input.Q)}m3.docx`;
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${name}"`,
        "Content-Length": String(docx.byteLength),
        "X-Note-Source": source,
        "X-Tz-Answers": String(opts.answers?.length ?? 0),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("note-docx build:", e);
    return Response.json({ ok: false, error: "Не удалось собрать документ записки." }, { status: 500 });
  }
}
