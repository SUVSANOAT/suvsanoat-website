/**
 * РАЗБОР ПРИЛОЖЕННОГО ТЗ / ТУ.
 *
 *   POST { file: { name, type, dataBase64 } } → { ok, extract }
 *
 * Проектировщик прикладывает техническое задание заказчика, технические
 * условия водоканала или протокол анализа. Модель читает документ и
 * возвращает исходные данные строгим JSON; сервер проверяет ответ
 * (app/engineering/analysis/industry/tz-extract.ts) и только потом
 * отдаёт странице. Разбор — вспомогательная операция: если ключа нет
 * или модель недоступна, страница должна продолжать работать с ручным
 * заполнением анкеты, поэтому ошибки возвращаются понятным текстом, а
 * не пятисотым кодом.
 *
 * Принимаются PDF (в том числе скан) и изображения — модель читает и
 * то и другое. Ограничение размера тела запроса на стороне платформы
 * жёстче, чем у API модели, поэтому крупные сканы отсекаются здесь с
 * внятным сообщением, а не падают в неизвестную ошибку.
 *
 * Переменные окружения те же, что у engineering-note:
 *   ANTHROPIC_API_KEY, ANTHROPIC_MODEL
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

import { INDUSTRIES } from "../../engineering/analysis/industry/industries";
import { t } from "../../engineering/analysis/industry/i18n";
import {
  industryListForPrompt,
  parseExtract,
  TZ_SYSTEM_PROMPT,
} from "../../engineering/analysis/industry/tz-extract";
import { sessionFromRequest } from "../../../lib/session";

const API_URL = "https://api.anthropic.com/v1/messages";
const DEFAULT_MODEL = "claude-sonnet-5";

/** предел размера файла после кодирования — ограничение платформы, не модели */
const MAX_BASE64 = 4 * 1024 * 1024;
const ALLOWED = ["application/pdf", "image/jpeg", "image/png", "image/webp", "image/gif"];

/* не больше N разборов в минуту с одного адреса: обращение к модели платное */
const hits = new Map<string, number[]>();
const LIMIT = 4;

function allowed(ip: string): boolean {
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((v) => now - v < 60_000);
  if (list.length >= LIMIT) return false;
  list.push(now);
  hits.set(ip, list);
  return true;
}

function fail(error: string, status = 400) {
  return Response.json({ ok: false, error }, { status });
}

/** блок содержимого для API: PDF идёт документом, картинка — изображением */
function contentBlock(type: string, data: string) {
  if (type === "application/pdf") {
    return { type: "document", source: { type: "base64", media_type: "application/pdf", data } };
  }
  return { type: "image", source: { type: "base64", media_type: type, data } };
}

export async function POST(request: Request) {
  if (!(await sessionFromRequest(request))) {
    return fail("Нужен вход в раздел «Инжиниринг».", 401);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return fail("Не удалось прочитать запрос.");
  }
  const file = (body as { file?: { name?: unknown; type?: unknown; dataBase64?: unknown } })?.file;
  if (!file || typeof file !== "object") return fail("Файл не приложен.");

  const type = String(file.type ?? "");
  const data = String(file.dataBase64 ?? "");
  const name = String(file.name ?? "документ").slice(0, 200);

  if (!ALLOWED.includes(type)) {
    return fail("Принимаются PDF, JPG, PNG, WEBP и GIF. Документ Word сохраните в PDF или сфотографируйте.");
  }
  if (!data) return fail("Файл пустой.");
  if (data.length > MAX_BASE64) {
    return fail(
      "Файл больше 3 МБ. Скан такого размера обычно избыточен: пересохраните PDF с меньшим разрешением " +
        "или сфотографируйте страницы по отдельности и приложите их по одной."
    );
  }

  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) {
    return fail(
      "Разбор документа сейчас недоступен — на сервере не задан ключ ИИ. Заполните анкету вручную, расчёт от этого не пострадает.",
      503
    );
  }

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (!allowed(ip)) {
    return fail("Слишком часто. Подождите минуту и приложите файл снова.", 429);
  }

  /* Перечень отраслей отдаём модели, чтобы id она брала из справочника,
     а не сочиняла: проверка на стороне сервера всё равно есть, но так
     ошибок меньше. */
  const list = industryListForPrompt(INDUSTRIES.map((i) => ({ id: i.id, name: t(i.name, "ru") })));
  const system = `${TZ_SYSTEM_PROMPT}\n\n${list}`;
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
        max_tokens: 8000,
        temperature: 0,
        system,
        messages: [
          {
            role: "user",
            content: [
              contentBlock(type, data),
              {
                type: "text",
                text:
                  `Файл: ${name}. Извлеки исходные данные по правилам и верни только JSON. ` +
                  `Помни: значение без дословной цитаты из документа недопустимо — ставь null.`,
              },
            ],
          },
        ],
      }),
    });
    clearTimeout(timer);

    if (!res.ok) {
      const err = await res.text().catch(() => "");
      console.error("tz-parse: API", res.status, err.slice(0, 300));
      if (res.status === 413) return fail("Файл слишком велик для разбора. Уменьшите разрешение скана.");
      return fail("Модель не смогла обработать документ. Попробуйте ещё раз или заполните анкету вручную.", 502);
    }

    const payload = (await res.json()) as { content?: { type: string; text?: string }[] };
    const text = (payload.content ?? [])
      .filter((c) => c.type === "text" && c.text)
      .map((c) => c.text)
      .join("")
      .trim();

    /* модель иногда оборачивает JSON в ```json — снимаем обрамление */
    const clean = text.replace(/^```(?:json)?\s*/i, "").replace(/```\s*$/, "").trim();
    let raw: unknown;
    try {
      raw = JSON.parse(clean);
    } catch {
      console.error("tz-parse: не JSON:", clean.slice(0, 300));
      return fail("Не удалось разобрать ответ модели. Заполните анкету вручную.", 502);
    }

    const extract = parseExtract(raw, INDUSTRIES.map((i) => i.id));
    return Response.json({ ok: true, model, extract });
  } catch (error) {
    console.error("tz-parse:", error);
    return fail("Разбор документа не завершился. Заполните анкету вручную.", 502);
  }
}
