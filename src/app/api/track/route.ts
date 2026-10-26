import { cookies } from "next/headers";
import { get, run } from "@/lib/db";
import { EVENT_KINDS } from "@/lib/analytics";

export async function POST(req: Request) {
  let body: { kind?: string; path?: string; productId?: number; value?: number; referrer?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(null, { status: 400 });
  }
  if (!EVENT_KINDS.includes(body.kind as (typeof EVENT_KINDS)[number])) return new Response(null, { status: 400 });
  const jar = await cookies();
  let sid = jar.get("kaya_sid")?.value;
  if (!sid) {
    sid = crypto.randomUUID();
  }
  // Sliding 30-minute visit window.
  jar.set("kaya_sid", sid, { path: "/", maxAge: 60 * 30, sameSite: "lax", httpOnly: true });
  if (jar.get("kaya_admin")) return new Response(null, { status: 204 });

  const ua = req.headers.get("user-agent") ?? "";
  if (/bot|crawl|spider|headless|preview/i.test(ua)) return new Response(null, { status: 204 });
  const device = /ipad|tablet/i.test(ua) ? "Tablet" : /mobi|android|iphone/i.test(ua) ? "Mobile" : "Desktop";
  let referrer = "";
  try {
    const host = new URL(req.url).host;
    const r = body.referrer ? new URL(body.referrer) : null;
    if (r && r.host !== host) referrer = r.host.replace(/^www\./, "");
  } catch {}
  const productId = Number(body.productId) || null;
  if (productId && !(await get("SELECT 1 FROM products WHERE id = ?", [productId]))) return new Response(null, { status: 204 });
  await run("INSERT INTO events (session_id, kind, path, product_id, value, referrer, device) VALUES (?,?,?,?,?,?,?)", [
    sid,
    body.kind!,
    String(body.path ?? "").slice(0, 200),
    productId,
    Math.max(0, Math.floor(Number(body.value) || 0)),
    referrer,
    device,
  ]);
  return new Response(null, { status: 204 });
}
