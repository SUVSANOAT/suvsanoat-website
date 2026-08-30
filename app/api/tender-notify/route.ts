export const dynamic = "force-dynamic";

/**
 * Ретранслятор уведомлений в Telegram.
 *
 * Ежедневный мониторинг тендеров не может обращаться к api.telegram.org
 * напрямую, поэтому шлёт текст сюда, а сервер сайта передаёт его боту.
 * Токен бота и chat_id хранятся в переменных окружения Vercel:
 *   TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID, TENDER_NOTIFY_KEY
 */

export async function GET(request: Request) {
  const url = new URL(request.url);

  const key = url.searchParams.get("key");
  if (!process.env.TENDER_NOTIFY_KEY || key !== process.env.TENDER_NOTIFY_KEY) {
    return new Response("forbidden", { status: 403 });
  }

  const text = (url.searchParams.get("text") ?? "").slice(0, 4000);
  if (!text.trim()) {
    return Response.json({ ok: false, error: "empty text" }, { status: 400 });
  }

  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) {
    return Response.json({ ok: false, error: "not configured" }, { status: 500 });
  }

  const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      disable_web_page_preview: true,
    }),
  });

  const result = await response.json().catch(() => null);

  return Response.json({ ok: result?.ok === true });
}
