export const dynamic = "force-dynamic";

import { sessionCookie } from "../../../../lib/session";

export async function POST() {
  return Response.json({ ok: true }, { headers: { "set-cookie": sessionCookie(null) } });
}
