/* ==================================================================
 * СОХРАНЁННЫЕ РАСЧЁТЫ ВОДОСНАБЖЕНИЯ — база Neon (Postgres)
 *
 * Проектировщик вводит профиль на девяносто точек, жителей по узлам,
 * диаметры, ограничения — и всё это живёт до перезагрузки страницы.
 * Здесь оно сохраняется: открыл, поправил одно число, посчитал заново.
 *
 * ЧТО ИМЕННО СОХРАНЯЕТСЯ
 *
 * Только введённое человеком: содержимое полей страницы. Результаты не
 * сохраняются никогда и ни при каких условиях. Причина простая: код
 * расчёта меняется — вчера в нём была ошибка, сегодня её нет. Если
 * хранить результат, при открытии старого проекта вернётся вчерашнее
 * число, и никто не поймёт, почему на экране одно, а в отчёте другое.
 * Сохранённый ввод пересчитывается текущим кодом всегда.
 *
 * ЧУЖОЕ НЕ ОТДАЁТСЯ
 *
 * Каждый запрос к проекту идёт с логином из подписанного cookie, и
 * логин входит в условие WHERE. Проект по чужому id не найдётся —
 * не «откажет в доступе», а именно не найдётся.
 *
 * Таблица создаётся сама при первом обращении, как users и
 * drawing_orders. Только для серверных маршрутов.
 * ================================================================== */

import { neon } from "@neondatabase/serverless";

import { dbUrl } from "./auth";

/** тип расчёта: водовод целиком, один участок, водопроводная сеть */
export type ProjectKind = "main" | "segment" | "network";
export const PROJECT_KINDS: ProjectKind[] = ["main", "segment", "network"];

export const KIND_LABEL: Record<ProjectKind, string> = {
  main: "Напорный водовод",
  segment: "Участок водовода",
  network: "Водопроводная сеть",
};

/** предел на один проект: девяносто точек профиля — это около 8 КБ,
 *  запас на порядок больше; всё, что крупнее, — не проект, а свалка */
export const MAX_PROJECT_BYTES = 512 * 1024;
/** предел на пользователя: чтобы забытый цикл сохранения не залил базу */
export const MAX_PROJECTS_PER_USER = 200;

export type WaterProject = {
  id: number;
  user_login: string;
  kind: ProjectKind;
  name: string;
  object: string;
  note: string;
  created_at: string;
  updated_at: string;
};

export type WaterProjectFull = WaterProject & { data: Record<string, unknown> };

export function dbConfigured(): boolean {
  return Boolean(dbUrl());
}

function db() {
  const url = dbUrl();
  if (!url) throw new Error("Строка подключения к базе не найдена (DATABASE_URL / POSTGRES_URL)");
  return neon(url);
}

let ready: Promise<void> | null = null;

export function ensureProjectsSchema(): Promise<void> {
  if (!ready) {
    const sql = db();
    ready = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS water_projects (
        id SERIAL PRIMARY KEY,
        user_login TEXT NOT NULL,
        kind TEXT NOT NULL,
        name TEXT NOT NULL DEFAULT '',
        object TEXT NOT NULL DEFAULT '',
        note TEXT NOT NULL DEFAULT '',
        data JSONB NOT NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
      await sql`CREATE INDEX IF NOT EXISTS water_projects_user_idx ON water_projects (user_login, kind, updated_at DESC)`;
    })().catch((e) => {
      ready = null;
      throw e;
    });
  }
  return ready;
}

export async function listProjects(login: string, kind?: ProjectKind): Promise<WaterProject[]> {
  await ensureProjectsSchema();
  const sql = db();
  const rows = kind
    ? await sql`SELECT id, user_login, kind, name, object, note, created_at, updated_at
        FROM water_projects WHERE user_login = ${login} AND kind = ${kind}
        ORDER BY updated_at DESC LIMIT ${MAX_PROJECTS_PER_USER}`
    : await sql`SELECT id, user_login, kind, name, object, note, created_at, updated_at
        FROM water_projects WHERE user_login = ${login}
        ORDER BY updated_at DESC LIMIT ${MAX_PROJECTS_PER_USER}`;
  return rows as WaterProject[];
}

export async function getProject(login: string, id: number): Promise<WaterProjectFull | null> {
  await ensureProjectsSchema();
  const sql = db();
  const rows = (await sql`SELECT id, user_login, kind, name, object, note, created_at, updated_at, data
    FROM water_projects WHERE user_login = ${login} AND id = ${id} LIMIT 1`) as WaterProjectFull[];
  return rows[0] ?? null;
}

export async function countProjects(login: string): Promise<number> {
  await ensureProjectsSchema();
  const sql = db();
  const rows = (await sql`SELECT COUNT(*)::int AS n FROM water_projects WHERE user_login = ${login}`) as { n: number }[];
  return rows[0]?.n ?? 0;
}

/**
 * Сохранение. Если передан id — обновляется свой же проект (чужой не
 * найдётся и обновлён не будет), иначе создаётся новый.
 */
export async function saveProject(
  login: string,
  input: { id?: number; kind: ProjectKind; name: string; object?: string; note?: string; data: Record<string, unknown> },
): Promise<WaterProject> {
  await ensureProjectsSchema();
  const sql = db();
  const name = (input.name || "Без названия").trim().slice(0, 160);
  const object = (input.object ?? "").trim().slice(0, 160);
  const note = (input.note ?? "").trim().slice(0, 400);
  const json = JSON.stringify(input.data ?? {});
  if (json.length > MAX_PROJECT_BYTES) {
    throw new Error(`Проект слишком большой: ${(json.length / 1024).toFixed(0)} КБ при пределе ${MAX_PROJECT_BYTES / 1024} КБ.`);
  }

  if (input.id) {
    const rows = (await sql`UPDATE water_projects
      SET name = ${name}, object = ${object}, note = ${note}, data = ${json}::jsonb, updated_at = NOW()
      WHERE id = ${input.id} AND user_login = ${login}
      RETURNING id, user_login, kind, name, object, note, created_at, updated_at`) as WaterProject[];
    if (!rows[0]) throw new Error("Проект не найден.");
    return rows[0];
  }

  if ((await countProjects(login)) >= MAX_PROJECTS_PER_USER) {
    throw new Error(`Достигнут предел в ${MAX_PROJECTS_PER_USER} сохранённых расчётов. Удалите ненужные.`);
  }
  const rows = (await sql`INSERT INTO water_projects (user_login, kind, name, object, note, data)
    VALUES (${login}, ${input.kind}, ${name}, ${object}, ${note}, ${json}::jsonb)
    RETURNING id, user_login, kind, name, object, note, created_at, updated_at`) as WaterProject[];
  return rows[0];
}

export async function deleteProject(login: string, id: number): Promise<boolean> {
  await ensureProjectsSchema();
  const sql = db();
  const rows = (await sql`DELETE FROM water_projects WHERE id = ${id} AND user_login = ${login} RETURNING id`) as { id: number }[];
  return rows.length > 0;
}
