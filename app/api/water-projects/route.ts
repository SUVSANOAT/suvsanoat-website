/**
 * СОХРАНЁННЫЕ РАСЧЁТЫ ВОДОСНАБЖЕНИЯ.
 *
 *   GET    /api/water-projects?kind=main            → список своих
 *   GET    /api/water-projects?id=12                → один проект с данными
 *   POST   { id?, kind, name, object?, note?, data } → сохранить
 *   DELETE /api/water-projects?id=12                 → удалить
 *
 * Требуется вход в раздел «Инжиниринг». Логин берётся из подписанного
 * cookie и подставляется в запрос — чужой проект не найдётся.
 *
 * Сохраняется только введённое человеком. Результаты не сохраняются:
 * код расчёта меняется, и старый результат при открытии проекта
 * разошёлся бы с тем, что страница считает сегодня.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import {
  dbConfigured,
  deleteProject,
  getProject,
  listProjects,
  saveProject,
  MAX_PROJECT_BYTES,
  PROJECT_KINDS,
  type ProjectKind,
} from "../../../lib/water-projects";
import { sessionFromRequest } from "../../../lib/session";

const NO_DB = "Сохранение недоступно: база данных не подключена (не задана DATABASE_URL).";

function kindOf(v: unknown): ProjectKind | undefined {
  return PROJECT_KINDS.includes(v as ProjectKind) ? (v as ProjectKind) : undefined;
}

export async function GET(request: Request) {
  const session = await sessionFromRequest(request);
  if (!session) return Response.json({ ok: false, error: "Нужен вход в раздел «Инжиниринг»." }, { status: 401 });
  if (!dbConfigured()) return Response.json({ ok: false, error: NO_DB }, { status: 503 });

  const url = new URL(request.url);
  const id = Number(url.searchParams.get("id") ?? "");
  try {
    if (Number.isFinite(id) && id > 0) {
      const project = await getProject(session.u, id);
      if (!project) return Response.json({ ok: false, error: "Проект не найден." }, { status: 404 });
      return Response.json({ ok: true, project });
    }
    const projects = await listProjects(session.u, kindOf(url.searchParams.get("kind")));
    return Response.json({ ok: true, projects });
  } catch (e) {
    console.error("water-projects GET:", e);
    return Response.json({ ok: false, error: "Не удалось прочитать список расчётов." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const session = await sessionFromRequest(request);
  if (!session) return Response.json({ ok: false, error: "Нужен вход в раздел «Инжиниринг»." }, { status: 401 });
  if (!dbConfigured()) return Response.json({ ok: false, error: NO_DB }, { status: 503 });

  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_PROJECT_BYTES) {
    return Response.json({ ok: false, error: "Слишком большой расчёт для сохранения." }, { status: 400 });
  }

  let body: Record<string, unknown>;
  try {
    const text = await request.text();
    if (text.length > MAX_PROJECT_BYTES) throw new Error("too big");
    body = JSON.parse(text) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "Неверный формат запроса." }, { status: 400 });
  }

  const kind = kindOf(body.kind);
  const data = body.data;
  if (!kind || typeof data !== "object" || data === null || Array.isArray(data)) {
    return Response.json({ ok: false, error: "Не указан тип расчёта или нет данных." }, { status: 400 });
  }
  const idRaw = Number(body.id ?? 0);

  try {
    const project = await saveProject(session.u, {
      id: Number.isFinite(idRaw) && idRaw > 0 ? idRaw : undefined,
      kind,
      name: String(body.name ?? ""),
      object: body.object === undefined ? undefined : String(body.object),
      note: body.note === undefined ? undefined : String(body.note),
      data: data as Record<string, unknown>,
    });
    return Response.json({ ok: true, project });
  } catch (e) {
    console.error("water-projects POST:", e);
    const msg = e instanceof Error ? e.message : "Не удалось сохранить расчёт.";
    return Response.json({ ok: false, error: msg }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  const session = await sessionFromRequest(request);
  if (!session) return Response.json({ ok: false, error: "Нужен вход в раздел «Инжиниринг»." }, { status: 401 });
  if (!dbConfigured()) return Response.json({ ok: false, error: NO_DB }, { status: 503 });

  const id = Number(new URL(request.url).searchParams.get("id") ?? "");
  if (!Number.isFinite(id) || id <= 0) return Response.json({ ok: false, error: "Не указан номер расчёта." }, { status: 400 });
  try {
    const done = await deleteProject(session.u, id);
    if (!done) return Response.json({ ok: false, error: "Проект не найден." }, { status: 404 });
    return Response.json({ ok: true });
  } catch (e) {
    console.error("water-projects DELETE:", e);
    return Response.json({ ok: false, error: "Не удалось удалить расчёт." }, { status: 500 });
  }
}
