import Link from "next/link";
import { Download } from "lucide-react";
import { adminBase } from "@/lib/auth";
import { all, get } from "@/lib/db";
import OrdersTable from "@/components/admin/OrdersTable";
import { Card, PageHeader, Tabs, btnSecondary, field } from "@/components/admin/ui";

const TABS: Record<string, { label: string; where: string }> = {
  all: { label: "All", where: "1=1" },
  unfulfilled: { label: "Unfulfilled", where: "status = 'open' AND fulfillment_status IN ('unfulfilled','packed')" },
  unpaid: { label: "Unpaid", where: "status = 'open' AND payment_status = 'pending'" },
  shipped: { label: "Shipped", where: "status = 'open' AND fulfillment_status = 'shipped'" },
  delivered: { label: "Delivered", where: "fulfillment_status = 'delivered'" },
  cancelled: { label: "Cancelled", where: "status = 'cancelled'" },
};
const PER = 40;

export default async function OrdersPage({ searchParams }: PageProps<"/admin/orders">) {
  const sp = await searchParams;
  const base = adminBase();
  const tab = typeof sp.tab === "string" && TABS[sp.tab] ? sp.tab : "all";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const page = Math.max(1, Number(sp.page) || 1);
  const where = [TABS[tab].where];
  const args: (string | number)[] = [];
  if (q) {
    where.push("(number LIKE ? OR name LIKE ? OR email LIKE ? OR phone LIKE ?)");
    const like = `%${q.replace(/^#/, "")}%`;
    args.push(like, like, like, like);
  }
  const w = where.join(" AND ");
  const [rows, total, counts] = await Promise.all([
    all<{ id: number; number: string; name: string; total: number; payment_status: string; fulfillment_status: string; created_at: string; status: string; is_sample: number }>(
      `SELECT id, number, name, total, payment_status, fulfillment_status, created_at, status, is_sample FROM orders WHERE ${w} ORDER BY created_at DESC, id DESC LIMIT ${PER} OFFSET ${(page - 1) * PER}`,
      args,
    ),
    get<{ n: number }>(`SELECT COUNT(*) AS n FROM orders WHERE ${w}`, args),
    Promise.all(Object.entries(TABS).map(async ([k, t]) => [k, Number((await get<{ n: number }>(`SELECT COUNT(*) AS n FROM orders WHERE ${t.where}`))?.n ?? 0)] as const)),
  ]);
  const count = Number(total?.n ?? 0);
  const pages = Math.max(1, Math.ceil(count / PER));
  const link = (p: Record<string, string | number>) => {
    const u = new URLSearchParams({ tab, ...(q && { q }), page: String(page), ...Object.fromEntries(Object.entries(p).map(([k, v]) => [k, String(v)])) });
    return `${base}/orders?${u}`;
  };

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        title="Orders"
        sub={`${count} order${count === 1 ? "" : "s"}`}
        actions={
          <a href={`${base}/orders/export?tab=${tab}`} className={btnSecondary}>
            <Download size={15} /> Export CSV
          </a>
        }
      />
      <Tabs items={Object.entries(TABS).map(([k, t]) => ({ href: `${base}/orders?tab=${k}`, label: t.label, count: Object.fromEntries(counts)[k] }))} active={TABS[tab].label} />
      <Card pad={false}>
        <form className="border-b border-black/[0.06] p-3" action={`${base}/orders`}>
          <input type="hidden" name="tab" value={tab} />
          <input name="q" defaultValue={q} placeholder="Search by order number, name, email or phone" className={field} />
        </form>
        <OrdersTable base={base} rows={rows} />
        {pages > 1 && (
          <div className="flex items-center justify-between border-t border-black/[0.06] px-5 py-3 text-[13px]">
            <span className="text-muted">
              Page {page} of {pages}
            </span>
            <div className="flex gap-2">
              {page > 1 && (
                <Link href={link({ page: page - 1 })} className={btnSecondary}>
                  Previous
                </Link>
              )}
              {page < pages && (
                <Link href={link({ page: page + 1 })} className={btnSecondary}>
                  Next
                </Link>
              )}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
