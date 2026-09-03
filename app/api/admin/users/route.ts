export const dynamic = "force-dynamic";

/**
 * Управление пользователями (только admin — проверяет proxy.ts,
 * здесь проверка дублируется).
 *   GET                       → { users }
 *   POST { login, name, company, phone, email, note, password? } → { user, password }
 *   PATCH { id, active } | { id, resetPassword: true } → { ok, password? }
 *   DELETE { id }
 */

import { createUser, deleteUser, generatePassword, listUsers, normalizeLogin, setUserActive, setUserPassword } from "../../../../lib/auth";
import { sessionFromRequest } from "../../../../lib/session";

async function admin(request: Request): Promise<Response | null> {
  const s = await sessionFromRequest(request);
  if (!s || s.r !== "admin") return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
  if (!process.env.DATABASE_URL) return Response.json({ ok: false, error: "DATABASE_URL не задан — подключите Neon в Vercel → Storage." }, { status: 500 });
  return null;
}

export async function GET(request: Request) {
  const deny = await admin(request);
  if (deny) return deny;
  try {
    return Response.json({ ok: true, users: await listUsers() });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const deny = await admin(request);
  if (deny) return deny;
  const b = (await request.json().catch(() => ({}))) as Record<string, string | undefined>;
  const login = normalizeLogin(b.login ?? "");
  if (!/^[a-z0-9._-]{3,40}$/.test(login)) {
    return Response.json({ ok: false, error: "Логин: 3–40 символов, латиница, цифры, точка, дефис." }, { status: 400 });
  }
  const password = (b.password ?? "").trim() || generatePassword();
  if (password.length < 6) return Response.json({ ok: false, error: "Пароль не короче 6 символов." }, { status: 400 });
  try {
    const user = await createUser({ login, password, name: b.name, company: b.company, phone: b.phone, email: b.email, note: b.note });
    return Response.json({ ok: true, user, password });
  } catch (e) {
    const msg = String(e);
    return Response.json({ ok: false, error: msg.includes("unique") || msg.includes("duplicate") ? "Такой логин уже есть." : msg }, { status: 400 });
  }
}

export async function PATCH(request: Request) {
  const deny = await admin(request);
  if (deny) return deny;
  const b = (await request.json().catch(() => ({}))) as { id?: number; active?: boolean; resetPassword?: boolean };
  if (!b.id) return Response.json({ ok: false, error: "id" }, { status: 400 });
  try {
    if (typeof b.active === "boolean") await setUserActive(b.id, b.active);
    if (b.resetPassword) {
      const password = generatePassword();
      await setUserPassword(b.id, password);
      return Response.json({ ok: true, password });
    }
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const deny = await admin(request);
  if (deny) return deny;
  const b = (await request.json().catch(() => ({}))) as { id?: number };
  if (!b.id) return Response.json({ ok: false, error: "id" }, { status: 400 });
  try {
    await deleteUser(b.id);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
