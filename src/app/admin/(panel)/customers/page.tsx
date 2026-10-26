import Link from "next/link";
import { adminBase } from "@/lib/auth";
import { all } from "@/lib/db";
import { Badge, Card, PageHeader, dateOnly, field } from "@/components/admin/ui";
import { formatINR } from "@/lib/utils";

export default async function CustomersPage({ searchParams }: PageProps<"/admin/customers">) {
  const sp = await searchParams;
  const base = adminBase();
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const rows = await all<{ id: number; name: string; email: string; created_at: string; orders: number; spent: number; last: string | null; account: number; marketing: number; is_sample: number }>(
    `SELECT c.id, c.name, c.email, c.created_at, c.is_sample, (c.password_hash IS NOT NULL) AS account,
       (c.accepts_marketing OR EXISTS (SELECT 1 FROM subscribers s WHERE s.email = c.email)) AS marketing,
       (SELECT COUNT(*) FROM orders o WHERE o.customer_id = c.id AND o.status != 'cancelled') AS orders,
       COALESCE((SELECT SUM(total) FROM orders o WHERE o.customer_id = c.id AND o.status != 'cancelled'), 0) AS spent,
       (SELECT MAX(created_at) FROM orders o WHERE o.customer_id = c.id) AS last
     FROM customers c ${q ? "WHERE c.name LIKE ?1 OR c.email LIKE ?1 OR c.phone LIKE ?1" : ""} ORDER BY spent DESC, c.id DESC LIMIT 300`,
    q ? [`%${q}%`] : [],
  );
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader title="Customers" sub={`${rows.length} customer${rows.length === 1 ? "" : "s"} · sorted by lifetime spend`} />
      <Card pad={false}>
        <form className="border-b border-black/[0.06] p-3" action={`${base}/customers`}>
          <input name="q" defaultValue={q} placeholder="Search by name, email or phone" className={field} />
        </form>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13.5px]">
            <thead className="border-b border-black/[0.06] text-[12px] text-muted">
              <tr>
                <th className="px-5 py-2.5 font-medium">Customer</th>
                <th className="px-3 py-2.5 font-medium">Orders</th>
                <th className="px-3 py-2.5 font-medium">Spent</th>
                <th className="px-3 py-2.5 font-medium">Last order</th>
                <th className="px-5 py-2.5 font-medium">Tags</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-[#FAF8F5]">
                  <td className="px-5 py-2.5">
                    <Link href={`${base}/customers/${c.id}`} className="font-medium hover:underline">
                      {c.name || c.email}
                    </Link>
                    <p className="text-[12.5px] text-muted">{c.email}</p>
                  </td>
                  <td className="px-3 py-2.5 tabular-nums">{c.orders}</td>
                  <td className="px-3 py-2.5 tabular-nums">{formatINR(c.spent)}</td>
                  <td className="px-3 py-2.5 text-muted">{c.last ? dateOnly(c.last) : "—"}</td>
                  <td className="space-x-1 px-5 py-2.5">
                    {c.orders > 1 && <Badge tone="green">Repeat</Badge>}
                    {c.account ? <Badge tone="blue">Account</Badge> : null}
                    {c.marketing ? <Badge>Subscribed</Badge> : null}
                    {c.is_sample ? <Badge tone="amber">Sample</Badge> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
