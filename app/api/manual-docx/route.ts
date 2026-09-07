/**
 * РУКОВОДСТВО ПО ЭКСПЛУАТАЦИИ ФАЙЛОМ WORD (.docx).
 *
 *   POST { note: NoteInput, bod5?, ss?, ph?, uv?, yearKWh?, date? }  →  .docx
 *
 * Сервер получает те же числа, что и записка (NoteInput), и ДОСЧИТЫВАЕТ
 * то, что руководству нужно сверх записки: приборы и блокировки,
 * порядок пуска и вывод в ремонт, годовые показатели, реагенты. Считает
 * сам, а не принимает готовые блоки с клиента: так руководство нельзя
 * собрать из подправленных вручную цифр — оно всегда соответствует
 * расчёту.
 *
 * ИИ здесь не участвует: руководство должно быть одинаковым при каждом
 * скачивании, а регламент и таблица неисправностей — это записанная
 * практика, а не текст, который стоит генерировать заново.
 */

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

import { isNoteInput, type NoteInput } from "../../engineering/analysis/pro-result/note-template";
import { buildManualDocx } from "../../engineering/analysis/pro-result/manual";
import { buildPid } from "../../../calculations/pid";
import { checkOutage, groupsFromChain } from "../../../calculations/outage";
import { calculateOpex } from "../../../calculations/opex";
import { calculateReagents } from "../../../calculations/reagents";
import { BOD5_TO_BODFULL } from "../../../norms/kmk-2-04-03-19";
import { sessionFromRequest } from "../../../lib/session";

const MAX_BODY_BYTES = 512 * 1024;

function num(v: unknown): number | undefined {
  const x = typeof v === "number" ? v : typeof v === "string" ? parseFloat(v.replace(",", ".")) : NaN;
  return Number.isFinite(x) ? x : undefined;
}

function fileSlug(s: string): string {
  const map: Record<string, string> = {
    а: "a", б: "b", в: "v", г: "g", д: "d", е: "e", ё: "e", ж: "zh", з: "z", и: "i", й: "y", к: "k", л: "l", м: "m",
    н: "n", о: "o", п: "p", р: "r", с: "s", т: "t", у: "u", ф: "f", х: "h", ц: "ts", ч: "ch", ш: "sh", щ: "sch",
    ъ: "", ы: "y", ь: "", э: "e", ю: "yu", я: "ya", ў: "u", қ: "q", ғ: "g", ҳ: "h",
  };
  return s.toLowerCase().split("").map((ch) => map[ch] ?? ch).join("").replace(/[^a-z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 60);
}

export async function POST(request: Request) {
  if (!(await sessionFromRequest(request))) {
    return Response.json({ ok: false, error: "Нужен вход в раздел «Инжиниринг»." }, { status: 401 });
  }
  const declared = Number(request.headers.get("content-length") ?? "0");
  if (Number.isFinite(declared) && declared > MAX_BODY_BYTES) {
    return Response.json({ ok: false, error: "Слишком большой запрос." }, { status: 413 });
  }
  const raw = await request.text().catch(() => "");
  if (raw.length > MAX_BODY_BYTES) {
    return Response.json({ ok: false, error: "Слишком большой запрос." }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return Response.json({ ok: false, error: "Неверный формат запроса." }, { status: 400 });
  }
  if (!isNoteInput(body.note)) {
    return Response.json({ ok: false, error: "Недостаточно данных для руководства." }, { status: 400 });
  }
  const note = body.note as NoteInput;
  const chain = note.stages.map((s) => s.key);
  const has = (k: string) => chain.includes(k);
  const Q = Math.max(0, note.Q);

  try {
    const pid = buildPid({
      stages: chain,
      inletPump: has("pump") || has("avg"),
      uv: body.uv !== false,
      blowers: 2,
      dosing: has("physchem") || has("neutral"),
    });
    const outage = checkOutage(groupsFromChain(chain));
    const opex = calculateOpex({
      flowM3Day: Q,
      bodFullMgL: (num(body.bod5) ?? 0) / BOD5_TO_BODFULL,
      tssMgL: num(body.ss) ?? 0,
      yearKWh: num(body.yearKWh) ?? note.power?.yearly,
      uv: body.uv !== false,
    });
    const reagents =
      has("physchem") || has("neutral") || has("daf")
        ? calculateReagents({
            flowM3Day: Q,
            hoursPerDay: 24,
            ph: num(body.ph) ?? note.ph,
            flocculant: "anionic",
            after: has("daf") ? "flotation" : "settling",
            stockDays: 30,
          })
        : undefined;

    const docx = buildManualDocx({
      note,
      pid,
      outage,
      opex,
      reagents,
      date: typeof body.date === "string" ? body.date.slice(0, 40) : undefined,
    });
    const buffer = new ArrayBuffer(docx.byteLength);
    new Uint8Array(buffer).set(docx);
    const name = `SUVSANOAT_rukovodstvo_${fileSlug(note.object || note.industry) || "obj"}_${Math.round(Q)}m3.docx`;
    return new Response(buffer, {
      headers: {
        "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        "Content-Disposition": `attachment; filename="${name}"`,
        "Content-Length": String(docx.byteLength),
        "Cache-Control": "no-store",
      },
    });
  } catch (e) {
    console.error("manual-docx build:", e);
    return Response.json({ ok: false, error: "Не удалось собрать руководство." }, { status: 500 });
  }
}
