/* ==================================================================
 * ПОЛЬЗОВАТЕЛИ И ЗАЯВКИ НА ДОСТУП — база Neon (Postgres)
 *
 * Только для серверных маршрутов (node:crypto). Таблицы создаются
 * сами при первом обращении. Пароли хранятся как scrypt-хэши.
 *
 * Переменные окружения:
 *   DATABASE_URL или POSTGRES_URL — ставит интеграция Neon в Vercel
 *   (имя зависит от версии интеграции, принимаются оба)
 *   ADMIN_LOGIN, ADMIN_PASSWORD — встроенный администратор (без БД)
 *   AUTH_SECRET     — секрет подписи cookie (желательно)
 * ================================================================== */

import { neon } from "@neondatabase/serverless";
import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

export type User = {
  id: number;
  login: string;
  name: string;
  company: string;
  phone: string;
  email: string;
  active: boolean;
  created_at: string;
  last_login: string | null;
  note: string;
};

export type AccessRequest = {
  id: number;
  name: string;
  company: string;
  phone: string;
  email: string;
  message: string;
  status: string;
  created_at: string;
};

/** строка подключения: интеграция Neon называет её по-разному */
export function dbUrl(): string | undefined {
  return (
    process.env.DATABASE_URL ||
    process.env.POSTGRES_URL ||
    process.env.DATABASE_URL_UNPOOLED ||
    process.env.POSTGRES_URL_NON_POOLING ||
    process.env.STORAGE_URL ||
    undefined
  );
}

function db() {
  const url = dbUrl();
  if (!url) throw new Error("Строка подключения к базе не найдена (DATABASE_URL / POSTGRES_URL)");
  return neon(url);
}

let schemaReady: Promise<void> | null = null;

export function ensureSchema(): Promise<void> {
  if (!schemaReady) {
    const sql = db();
    schemaReady = (async () => {
      await sql`CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        login TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL DEFAULT '',
        company TEXT NOT NULL DEFAULT '',
        phone TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '',
        active BOOLEAN NOT NULL DEFAULT TRUE,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_login TIMESTAMPTZ,
        note TEXT NOT NULL DEFAULT ''
      )`;
      await sql`CREATE TABLE IF NOT EXISTS access_requests (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL DEFAULT '',
        company TEXT NOT NULL DEFAULT '',
        phone TEXT NOT NULL DEFAULT '',
        email TEXT NOT NULL DEFAULT '',
        message TEXT NOT NULL DEFAULT '',
        status TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )`;
    })().catch((e) => {
      schemaReady = null;
      throw e;
    });
  }
  return schemaReady;
}

/* ---------------- пароли ---------------- */

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 32).toString("hex");
  return `scrypt$${salt}$${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [algo, salt, hash] = stored.split("$");
  if (algo !== "scrypt" || !salt || !hash) return false;
  const a = scryptSync(password, salt, 32);
  const b = Buffer.from(hash, "hex");
  return a.length === b.length && timingSafeEqual(a, b);
}

/** пароль вида "Suv-7k3m9p" — читаемый, без похожих символов */
export function generatePassword(): string {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  const bytes = randomBytes(8);
  let s = "";
  for (const b of bytes) s += alphabet[b % alphabet.length];
  return `Suv-${s}`;
}

export function normalizeLogin(login: string): string {
  return login.trim().toLowerCase().replace(/\s+/g, "");
}

/* ---------------- пользователи ---------------- */


export async function findUserForLogin(login: string): Promise<(User & { password_hash: string }) | null> {
  await ensureSchema();
  const sql = db();
  const rows = (await sql`SELECT id, login, name, company, phone, email, active, created_at, last_login, note, password_hash FROM users WHERE login = ${normalizeLogin(login)} LIMIT 1`) as (User & { password_hash: string })[];
  return rows[0] ?? null;
}

export async function touchLogin(id: number): Promise<void> {
  const sql = db();
  await sql`UPDATE users SET last_login = NOW() WHERE id = ${id}`;
}

export async function listUsers(): Promise<User[]> {
  await ensureSchema();
  const sql = db();
  return (await sql`SELECT id, login, name, company, phone, email, active, created_at, last_login, note FROM users ORDER BY created_at DESC`) as User[];
}

export async function createUser(input: {
  login: string;
  password: string;
  name?: string;
  company?: string;
  phone?: string;
  email?: string;
  note?: string;
}): Promise<User> {
  await ensureSchema();
  const sql = db();
  const rows = (await sql`INSERT INTO users (login, password_hash, name, company, phone, email, note)
    VALUES (${normalizeLogin(input.login)}, ${hashPassword(input.password)}, ${input.name ?? ""}, ${input.company ?? ""}, ${input.phone ?? ""}, ${input.email ?? ""}, ${input.note ?? ""})
    RETURNING id, login, name, company, phone, email, active, created_at, last_login, note`) as User[];
  return rows[0];
}

export async function setUserActive(id: number, active: boolean): Promise<void> {
  const sql = db();
  await sql`UPDATE users SET active = ${active} WHERE id = ${id}`;
}

export async function setUserPassword(id: number, password: string): Promise<void> {
  const sql = db();
  await sql`UPDATE users SET password_hash = ${hashPassword(password)} WHERE id = ${id}`;
}

export async function deleteUser(id: number): Promise<void> {
  const sql = db();
  await sql`DELETE FROM users WHERE id = ${id}`;
}

/* ---------------- заявки ---------------- */

export async function addRequest(input: { name: string; company: string; phone: string; email: string; message: string }): Promise<AccessRequest> {
  await ensureSchema();
  const sql = db();
  const rows = (await sql`INSERT INTO access_requests (name, company, phone, email, message)
    VALUES (${input.name}, ${input.company}, ${input.phone}, ${input.email}, ${input.message})
    RETURNING *`) as AccessRequest[];
  return rows[0];
}

export async function listRequests(): Promise<AccessRequest[]> {
  await ensureSchema();
  const sql = db();
  return (await sql`SELECT * FROM access_requests ORDER BY created_at DESC LIMIT 200`) as AccessRequest[];
}

export async function setRequestStatus(id: number, status: string): Promise<void> {
  const sql = db();
  await sql`UPDATE access_requests SET status = ${status} WHERE id = ${id}`;
}

/* ---------------- Telegram — тот же бот, что и форма заявок ---------------- */

export async function notifyTelegram(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN ?? process.env.TENDER_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID ?? process.env.TENDER_CHAT_ID;
  if (!token || !chat) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ chat_id: chat, text, disable_web_page_preview: true }),
    });
  } catch (e) {
    console.error("telegram:", e);
  }
}
