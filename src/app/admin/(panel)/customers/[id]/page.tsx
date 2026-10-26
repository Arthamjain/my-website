import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { adminBase } from "@/lib/auth";
import { all, get } from "@/lib/db";
import OrdersTable from "@/components/admin/OrdersTable";
import { Card, dateOnly } from "@/components/admin/ui";
import { formatINR } from "@/lib/utils";

export default async function CustomerDetail({ params }: PageProps<"/admin/customers/[id]">) {
  const { id } = await params;
  const base = adminBase();
  const c = await get<{ id: number; name: string; email: string; phone: string; created_at: string; password_hash: string | null; accepts_marketing: number }>(
    "SELECT * FROM customers WHERE id = ?",
    [Number(id)],
  );
  if (!c) notFound();
  const orders = await all<{ id: number; number: string; name: string; total: number; payment_status: string; fulfillment_status: string; created_at: string; status: string; address: string }>(
    "SELECT id, number, name, total, payment_status, fulfillment_status, created_at, status, address FROM orders WHERE customer_id = ? ORDER BY created_at DESC",
    [c.id],
  );
  const live = orders.filter((o) => o.status !== "cancelled");
  const spent = live.reduce((n, o) => n + o.total, 0);
  const addr = orders[0] ? JSON.parse(orders[0].address) : null;
  return (
    <div className="mx-auto max-w-[1100px]">
      <Link href={`${base}/customers`} className="mb-3 inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink">
        <ArrowLeft size={14} /> Customers
      </Link>
      <h1 className="text-[24px] font-semibold tracking-tight">{c.name || c.email}</h1>
      <p className="mb-6 text-[13px] text-muted">Customer since {dateOnly(c.created_at)}</p>
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {[
              ["Lifetime spend", formatINR(spent)],
              ["Orders", String(live.length)],
              ["Average order", formatINR(live.length ? Math.round(spent / live.length) : 0)],
            ].map(([l, v]) => (
              <div key={l} className="rounded-xl border border-black/[0.07] bg-white p-4">
                <p className="text-[12px] text-muted">{l}</p>
                <p className="mt-1 text-[20px] font-semibold tabular-nums">{v}</p>
              </div>
            ))}
          </div>
          <Card title="Orders" pad={false}>
            <OrdersTable base={base} rows={orders} />
          </Card>
        </div>
        <div className="space-y-4">
          <Card title="Contact">
            <a href={`mailto:${c.email}`} className="block text-indigo hover:underline">
              {c.email}
            </a>
            {c.phone && <p className="text-muted">{c.phone}</p>}
            <p className="mt-3 text-[13px] text-muted">{c.password_hash ? "Has a store account" : "Guest checkout"} · {c.accepts_marketing ? "Subscribed to letters" : "Not subscribed"}</p>
          </Card>
          {addr && (
            <Card title="Latest address">
              <p className="text-[13.5px] leading-relaxed">
                {addr.line1}
                <br />
                {addr.line2 && (
                  <>
                    {addr.line2}
                    <br />
                  </>
                )}
                {addr.city}, {addr.state} {addr.pincode}
              </p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
