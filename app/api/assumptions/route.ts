export const dynamic = "force-dynamic";

/**
 * Коэффициенты расчёта.
 *
 *   GET  → { ok, values, overrides, meta } — значения по умолчанию с
 *          переопределениями из базы; доступно всем, расчёт идёт в браузере.
 *   PUT  → { values: {key: number} } — сохранение (только admin).
 *   DELETE → { key } — возврат одного значения к нормативному (только admin).
 *
 * Значения вне допустимого диапазона отбрасываются в lib/assumptions.
 */

import {
  assumptionsMeta,
  dbUrl,
  getAssumptionOverrides,
  resetAssumption,
  saveAssumptions,
} from "../../../lib/auth";
import { DEFAULT_ASSUMPTIONS, mergeAssumptions, sanitize } from "../../../lib/assumptions";
import { sessionFromRequest } from "../../../lib/session";

export async function GET() {
  if (!dbUrl()) {
    return Response.json({ ok: true, values: DEFAULT_ASSUMPTIONS, overrides: {}, meta: [] });
  }
  try {
    const overrides = await getAssumptionOverrides();
    return Response.json({
      ok: true,
      values: mergeAssumptions(overrides),
      overrides,
      meta: await assumptionsMeta(),
    });
  } catch (e) {
    console.error("assumptions GET:", e);
    return Response.json({ ok: true, values: DEFAULT_ASSUMPTIONS, overrides: {}, meta: [] });
  }
}

async function admin(request: Request): Promise<Response | null> {
  const s = await sessionFromRequest(request);
  if (!s || s.r !== "admin") return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
  if (!dbUrl()) return Response.json({ ok: false, error: "База не подключена — сохранять некуда." }, { status: 500 });
  return null;
}

export async function PUT(request: Request) {
  const deny = await admin(request);
  if (deny) return deny;
  const session = await sessionFromRequest(request);

  const body = (await request.json().catch(() => ({}))) as { values?: Record<string, unknown> };
  if (!body.values || typeof body.values !== "object") {
    return Response.json({ ok: false, error: "нет значений" }, { status: 400 });
  }

  const clean: Record<string, number> = {};
  const rejected: string[] = [];
  for (const [key, raw] of Object.entries(body.values)) {
    const v = sanitize(key, raw);
    if (v === null) rejected.push(key);
    else clean[key] = v;
  }
  if (!Object.keys(clean).length) {
    return Response.json({ ok: false, error: "все значения вне допустимого диапазона", rejected }, { status: 400 });
  }

  try {
    await saveAssumptions(clean, session?.u ?? "admin");
    return Response.json({ ok: true, saved: Object.keys(clean).length, rejected });
  } catch (e) {
    console.error("assumptions PUT:", e);
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const deny = await admin(request);
  if (deny) return deny;
  const body = (await request.json().catch(() => ({}))) as { key?: string };
  if (!body.key) return Response.json({ ok: false, error: "нет ключа" }, { status: 400 });
  try {
    await resetAssumption(body.key);
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
