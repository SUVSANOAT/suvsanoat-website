export const dynamic = "force-dynamic";

import { listRequests, setRequestStatus } from "../../../../lib/auth";
import { sessionFromRequest } from "../../../../lib/session";

async function admin(request: Request): Promise<Response | null> {
  const s = await sessionFromRequest(request);
  if (!s || s.r !== "admin") return Response.json({ ok: false, error: "forbidden" }, { status: 403 });
  if (!process.env.DATABASE_URL) return Response.json({ ok: false, error: "DATABASE_URL не задан." }, { status: 500 });
  return null;
}

export async function GET(request: Request) {
  const deny = await admin(request);
  if (deny) return deny;
  try {
    return Response.json({ ok: true, requests: await listRequests() });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const deny = await admin(request);
  if (deny) return deny;
  const b = (await request.json().catch(() => ({}))) as { id?: number; status?: string };
  if (!b.id || !b.status) return Response.json({ ok: false, error: "id, status" }, { status: 400 });
  try {
    await setRequestStatus(b.id, b.status.slice(0, 20));
    return Response.json({ ok: true });
  } catch (e) {
    return Response.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
