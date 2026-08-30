export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Файл лидов по завершённым тендерам за последние N дней.
 *
 * GET /api/tender-leads?key=...            — скачать CSV (Excel открывает сразу)
 * GET /api/tender-leads?key=...&send=1     — построить CSV и отправить файлом в Телеграм-бот
 *
 * Свежие итоги сверху. Победитель и ИНН — из протокола тендера.
 */

const KEYS = [
  "kanalizatsiya", "канализация", "oqova", "оқова", "tozalash", "тозалаш",
  "очистн", "nasos", "насос", "KNS", "КНС", "rezervuar", "резервуар",
  "quduq", "қудуқ", "скважин", "septik", "септик", "xlor", "хлор",
  "ливнев", "vodoprovod", "водопровод", "ichimlik", "ичимлик",
  "водоснабжени", "водоотведени",
];

const API = "https://apisitender.mc.uz";

/* мусор: ирригация, полив, тепловые пункты, город Учкудук */
const DROP = /суғориш|sug['ʻ`’]?orish|полив|кўкаламзор|ko['ʻ`’]?kalamzor|иссиқлик пункт|issiqlik punkt|Учқудуқ|Uchquduq|зовур|ирригация|irrigatsiya|сел-сув|машина канали|латок|бетонлаштириш|каналининг|kanalini|коллекторини тизимли|kollektorini tizimli|коллектор тармокларини|стадион|спорт|лифт/i;

function category(name: string): [string, number] {
  const t = name.toLowerCase();
  if (/резервуар|rezervua|водонапорн|suv minora|сув минора|баландлик|выгребн|ёмкост/.test(t)) return ["Резервуары/ёмкости", 1];
  if (/очистн|тозалаш иншоот|tozalash insho/.test(t)) return ["Очистные", 1];
  if (/канализац|kanalizatsiya|оқова|oqova|okova/.test(t)) return ["Канализация", 1];
  if (/насосн\S* станц|nasos stansiya/.test(t)) return ["Насосные станции", 2];
  if (/скважин|артезиан|artezian|arteizian|quduq|қудуқ/.test(t)) return ["Скважины", 2];
  if (/питьев|водоснабж|водопровод|ichimlik|ичимлик|suv tarmo|сув тармо/.test(t)) return ["Сети воды", 2];
  return ["Прочее водное", 3];
}

function uzTime(msAgo: number): string {
  const d = new Date(Date.now() + 5 * 3600_000 - msAgo);
  return d.toISOString().slice(0, 19).replace("T", " ");
}

function csvCell(value: unknown): string {
  const s = String(value ?? "").replace(/\s+/g, " ").trim();
  return '"' + s.replace(/"/g, '""') + '"';
}

export async function GET(request: Request) {
  const url = new URL(request.url);

  const key = url.searchParams.get("key");
  if (!process.env.TENDER_NOTIFY_KEY || key !== process.env.TENDER_NOTIFY_KEY) {
    return new Response("forbidden", { status: 403 });
  }

  const days = Math.min(Number(url.searchParams.get("days") ?? 30) || 30, 45);
  const sinceWinner = uzTime(days * 24 * 3600_000);
  const sinceConfirmed = uzTime((days + 60) * 24 * 3600_000);

  type Lead = Record<string, unknown>;
  const found = new Map<number, Lead>();

  await Promise.all(
    KEYS.map(async (word) => {
      for (let page = 1; page <= 8; page++) {
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
          if (DROP.test(t.name ?? "")) continue;
          if (!found.has(t.id)) {
            found.set(t.id, {
              id: t.id,
              name: String(t.name ?? "").slice(0, 180),
              region: (t.region?.name ?? "").replace(" область", "").replace("Республика ", ""),
              customer: String(t.customer?.name ?? "").slice(0, 80),
              wd: String(wd).slice(0, 10),
            });
          }
        }
        if (older) break;
      }
    })
  );

  const items = [...found.values()];

  await Promise.all(
    items.map(async (item) => {
      const detail = await fetch(`${API}/api/tenders/${item.id}`, { cache: "no-store" })
        .then((r) => r.json())
        .catch(() => null);

      const d = detail?.result?.data;
      if (!d) return;
      item.custPhone = d.customer?.phone ?? "";

      const result = await fetch(`${API}/api/offeror/tender-result`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ unique_name: d.unique_name }),
        cache: "no-store",
      })
        .then((r) => r.json())
        .catch(() => null);

      const winner = (result?.result?.data?.bidders ?? []).find(
        (b: { is_winner: number }) => b.is_winner === 1
      );
      if (winner) {
        item.winner = winner.name;
        item.inn = winner.inn;
        item.offer = winner.offer;
        item.bidders = (result?.result?.data?.bidders ?? []).length;
        item.workDays = winner.day;
      }
    })
  );

  const prioLabel: Record<number, string> = { 1: "ГОРЯЧИЙ", 2: "Средний", 3: "Низкий" };
  /* eslint-disable @typescript-eslint/no-explicit-any */
  const rows: any[] = items
    .filter((x) => x.winner)
    .map((x) => {
      const [cat, prio] = category(String(x.name));
      return { ...(x as Record<string, unknown>), cat, prio } as any;
    })
    .sort((a, b) =>
      a.wd === b.wd ? a.prio - b.prio : String(a.wd) < String(b.wd) ? 1 : -1
    );

  const header = [
    "Итоги (дата)", "Приоритет", "Категория", "Что строится", "Регион",
    "Победитель (кому звонить)", "ИНН победителя", "Контракт, млн сум",
    "Участников", "Срок, дн", "Заказчик", "Тел. заказчика", "Ссылка",
  ].join(";");

  const lines = rows.map((x) =>
    [
      x.wd, prioLabel[x.prio as number], csvCell(x.cat), csvCell(x.name), csvCell(x.region),
      csvCell(x.winner), x.inn,
      x.offer ? (Number(x.offer) / 1e6).toFixed(1).replace(".", ",") : "",
      x.bidders ?? "", x.workDays ?? "", csvCell(x.customer),
      x.custPhone ? "+" + x.custPhone : "",
      `https://tender.mc.uz/tender-list/tender/${x.id}/view`,
    ].join(";")
  );

  const today = uzTime(0).slice(0, 10);
  const csv = "﻿" + header + "\n" + lines.join("\n");
  const filename = `Lidy_tendery_${today}.csv`;

  if (url.searchParams.get("send") === "1") {
    const token = process.env.TENDER_BOT_TOKEN ?? process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TENDER_CHAT_ID ?? process.env.TELEGRAM_CHAT_ID;
    if (!token || !chatId) {
      return Response.json({ ok: false, error: "not configured" }, { status: 500 });
    }

    const form = new FormData();
    form.append("chat_id", String(chatId));
    form.append(
      "caption",
      `Лиды по завершённым тендерам за ${days} дн · ${rows.length} шт · свежие сверху`
    );
    form.append("document", new Blob([csv], { type: "text/csv" }), filename);

    const sent = await fetch(`https://api.telegram.org/bot${token}/sendDocument`, {
      method: "POST",
      body: form,
    })
      .then((r) => r.json())
      .catch(() => null);

    return Response.json({ ok: sent?.ok === true, count: rows.length });
  }

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
