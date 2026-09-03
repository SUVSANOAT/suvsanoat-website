export const dynamic = "force-dynamic";

/**
 * Заявка на доступ со страницы входа: пишется в базу и уходит
 * в Telegram (бот формы заявок). Логин и пароль выдаёт SUVSANOAT.
 */

import { addRequest, notifyTelegram } from "../../../../lib/auth";

const hits = new Map<string, number[]>();

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const list = (hits.get(ip) ?? []).filter((t) => now - t < 3_600_000);
  if (list.length >= 5) return Response.json({ ok: false, error: "Заявка уже отправлена. Мы свяжемся с вами." }, { status: 429 });
  list.push(now);
  hits.set(ip, list);

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return Response.json({ ok: false, error: "bad json" }, { status: 400 });
  }
  const s = (k: string, max = 200) => String(body[k] ?? "").trim().slice(0, max);
  const input = { name: s("name"), company: s("company"), phone: s("phone", 40), email: s("email", 120), message: s("message", 1000) };
  if (!input.name || !input.phone) return Response.json({ ok: false, error: "Укажите имя и телефон." }, { status: 400 });
  if (s("website")) return Response.json({ ok: true }); // ловушка для ботов

  try {
    if (process.env.DATABASE_URL) await addRequest(input);
  } catch (e) {
    console.error("access request db:", e);
  }
  await notifyTelegram(
    `🔑 Заявка на доступ к разделу «Инжиниринг»\n\n` +
      `Имя: ${input.name}\nКомпания: ${input.company || "—"}\nТелефон: ${input.phone}\nE-mail: ${input.email || "—"}\n` +
      (input.message ? `\n${input.message}\n` : "") +
      `\nВыдать доступ: suvsanoat.uz/engineering/admin`
  );
  return Response.json({ ok: true });
}
