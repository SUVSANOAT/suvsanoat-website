export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Вчерашние победители тендеров tender.mc.uz по водному профилю.
 *
 * Ежедневный мониторинг не может делать POST к api тендерной площадки,
 * поэтому сервер сайта сам опрашивает список по ключевым словам,
 * отбирает тендеры, где победитель определён за последние N часов,
 * и вытаскивает из протокола название и ИНН победителя.
 * GET /api/tender-winners?key=...&hours=26
 */

const KEYS = [
  "kanalizatsiya", "канализация", "oqova", "оқова", "tozalash", "тозалаш",
  "очистн", "nasos", "насос", "KNS", "КНС", "rezervuar", "резервуар",
  "quduq", "қудуқ", "скважин", "septik", "септик", "xlor", "хлор",
  "ливнев", "vodoprovod", "водопровод", "ichimlik", "ичимлик",
  "водоснабжени", "водоотведени",
];

const API = "https://apisitender.mc.uz";

function uzTime(msAgo: number): string {
  /* даты площадки — ташкентское время (UTC+5) */
  const d = new Date(Date.now() + 5 * 3600_000 - msAgo);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const key = url.searchParams.get("key");
  if (!process.env.TENDER_NOTIFY_KEY || key !== process.env.TENDER_NOTIFY_KEY) {
    return new Response("forbidden", { status: 403 });
  }

  const hours = Math.min(Number(url.searchParams.get("hours") ?? 26) || 26, 24 * 14);
  const sinceWinner = uzTime(hours * 3600_000);
  const sinceConfirmed = uzTime(60 * 24 * 3600_000);

  const found = new Map<number, Record<string, unknown>>();

  await Promise.all(
    KEYS.map(async (word) => {
      for (let page = 1; page <= 3; page++) {
        const list = await fetch(
          `${API}/api/tenders?per_page=30&page=${page}&sort_by=desc&order_by=confirmed_date&name=${encodeURIComponent(word)}`,
          { cache: "no-store" }
        )
          .then((r) => r.json())
          .catch(() => null);

        const data = list?.result?.data ?? [];
        if (!data.length) break;

        let older = false;
        for (const t of data) {
          if (t.confirmed_date && t.confirmed_date < sinceConfirmed) {
            older = true;
            continue;
          }
          const wd = t.winner_determined_date;
          if (!wd || wd < sinceWinner) continue;
          if (!found.has(t.id)) {
            found.set(t.id, {
              id: t.id,
              name: t.name,
              region: t.region?.name ?? null,
              customer: t.customer?.name ?? null,
              start_price: t.start_price,
              winner_determined: wd,
            });
          }
        }
        if (older) break;
      }
    })
  );

  const items = [...found.values()].slice(0, 25);

  await Promise.all(
    items.map(async (item) => {
      const detail = await fetch(`${API}/api/tenders/${item.id}`, { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => null);

      const uniqueName = detail?.result?.data?.unique_name;
      if (!uniqueName) return;

      const result = await fetch(`${API}/api/offeror/tender-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unique_name: uniqueName }),
        cache: "no-store",
      })
        .then((r) => r.json())
        .catch(() => null);

      const bidders = result?.result?.data?.bidders ?? [];
      const winner = bidders.find((b: { is_winner: number }) => b.is_winner === 1);
      if (winner) {
        item.winner = winner.name;
        item.winner_inn = winner.inn;
        item.contract_price = winner.offer;
        item.work_days = winner.day;
      }
    })
  );

  return Response.json({ count: items.length, items });
}
