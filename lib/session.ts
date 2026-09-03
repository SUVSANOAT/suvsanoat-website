/* ==================================================================
 * СЕССИЯ: ПОДПИСАННЫЙ COOKIE
 *
 * Токен = base64url(JSON) + "." + base64url(HMAC-SHA256).
 * Только Web Crypto — файл одинаково работает в proxy.ts и в
 * маршрутах API. Секрет: AUTH_SECRET, а если он не задан —
 * производная от DATABASE_URL (чтобы вход работал сразу; но
 * лучше задать AUTH_SECRET явно — тогда смена БД не разлогинит всех).
 * ================================================================== */

export const SESSION_COOKIE = "sv_session";
export const SESSION_DAYS = 30;

export type Session = {
  /** логин */
  u: string;
  /** роль */
  r: "admin" | "user";
  /** имя для показа */
  n: string;
  /** срок, unix-секунды */
  e: number;
};

function secretString(): string {
  return process.env.AUTH_SECRET || ("sv|" + (process.env.DATABASE_URL || "") + "|fallback");
}

async function key(): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", new TextEncoder().encode(secretString()), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
}

function b64u(bytes: ArrayBuffer | Uint8Array): string {
  const arr = bytes instanceof Uint8Array ? bytes : new Uint8Array(bytes);
  let s = "";
  for (const b of arr) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function unb64u(s: string): Uint8Array<ArrayBuffer> {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/") + pad);
  const out = new Uint8Array(new ArrayBuffer(bin.length));
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

export async function signSession(data: Omit<Session, "e">): Promise<string> {
  const payload: Session = { ...data, e: Math.floor(Date.now() / 1000) + SESSION_DAYS * 86400 };
  const body = b64u(new TextEncoder().encode(JSON.stringify(payload)));
  const sig = await crypto.subtle.sign("HMAC", await key(), new TextEncoder().encode(body));
  return `${body}.${b64u(sig)}`;
}

export async function verifySession(token: string | undefined | null): Promise<Session | null> {
  if (!token) return null;
  const dot = token.indexOf(".");
  if (dot < 0) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  try {
    const ok = await crypto.subtle.verify("HMAC", await key(), unb64u(sig), new TextEncoder().encode(body));
    if (!ok) return null;
    const data = JSON.parse(new TextDecoder().decode(unb64u(body))) as Session;
    if (!data || typeof data.u !== "string" || typeof data.e !== "number") return null;
    if (data.e < Date.now() / 1000) return null;
    return data;
  } catch {
    return null;
  }
}

/** значение Set-Cookie для входа/выхода */
export function sessionCookie(token: string | null): string {
  const base = `${SESSION_COOKIE}=${token ?? ""}; Path=/; HttpOnly; SameSite=Lax; Secure`;
  return token ? `${base}; Max-Age=${SESSION_DAYS * 86400}` : `${base}; Max-Age=0`;
}

/** сессия из заголовка Cookie запроса (для маршрутов API) */
export async function sessionFromRequest(request: Request): Promise<Session | null> {
  const raw = request.headers.get("cookie") ?? "";
  const m = raw.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE}=([^;]+)`));
  return verifySession(m ? decodeURIComponent(m[1]) : null);
}
