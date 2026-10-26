import { getAdmin } from "@/lib/auth";
import { all } from "@/lib/db";

const WHERE: Record<string, string> = {
  unfulfilled: "status = 'open' AND fulfillment_status IN ('unfulfilled','packed')",
  unpaid: "status = 'open' AND payment_status = 'pending'",
  shipped: "status = 'open' AND fulfillment_status = 'shipped'",
  delivered: "fulfillment_status = 'delivered'",
  cancelled: "status = 'cancelled'",
};

const csv = (v: unknown) => {
  const s = String(v ?? "");
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
};

export async function GET(req: Request) {
  if (!(await getAdmin())) return new Response("Unauthorized", { status: 401 });
  const tab = new URL(req.url).searchParams.get("tab") ?? "all";
  const rows = await all<Record<string, unknown>>(
    `SELECT o.number, o.created_at, o.name, o.email, o.phone, o.address, o.subtotal, o.discount, o.discount_code, o.shipping, o.cod_fee, o.tax, o.total,
       o.payment_method, o.payment_status, o.fulfillment_status, o.status, o.carrier, o.tracking_number,
       (SELECT GROUP_CONCAT(i.qty || ' x ' || i.title || ' (' || i.variant_title || ')', '; ') FROM order_items i WHERE i.order_id = o.id) AS items
     FROM orders o WHERE ${WHERE[tab] ?? "1=1"} ORDER BY o.created_at DESC`,
  );
  const cols = ["number", "created_at", "name", "email", "phone", "address", "items", "subtotal", "discount", "discount_code", "shipping", "cod_fee", "tax", "total", "payment_method", "payment_status", "fulfillment_status", "status", "carrier", "tracking_number"];
  const body = [cols.join(","), ...rows.map((r) => {
    const a = (() => { try { const x = JSON.parse(String(r.address)); return [x.line1, x.line2, x.city, x.state, x.pincode].filter(Boolean).join(", "); } catch { return ""; } })();
    return cols.map((c) => csv(c === "address" ? a : r[c])).join(",");
  })].join("\n");
  return new Response(body, {
    headers: { "Content-Type": "text/csv; charset=utf-8", "Content-Disposition": `attachment; filename="kaya-orders-${tab}-${new Date().toISOString().slice(0, 10)}.csv"` },
  });
}
