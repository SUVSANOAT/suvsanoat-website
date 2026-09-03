export const dynamic = "force-dynamic";

import { sessionFromRequest } from "../../../../lib/session";

export async function GET(request: Request) {
  const s = await sessionFromRequest(request);
  if (!s) return Response.json({ ok: false }, { status: 401 });
  return Response.json({ ok: true, login: s.u, role: s.r, name: s.n });
}
