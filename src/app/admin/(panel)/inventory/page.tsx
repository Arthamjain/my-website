import Link from "next/link";
import { adminBase } from "@/lib/auth";
import { all } from "@/lib/db";
import { setStock } from "../../actions";
import { Badge, Card, PageHeader, btnSecondary, field } from "@/components/admin/ui";

export default async function InventoryPage({ searchParams }: PageProps<"/admin/inventory">) {
  const sp = await searchParams;
  const base = adminBase();
  const low = sp.filter === "low";
  const rows = await all<{ id: number; product_id: number; title: string; vtitle: string; sku: string; stock: number; status: string; sold30: number }>(
    `SELECT v.id, v.product_id, p.title, v.title AS vtitle, v.sku, v.stock, p.status,
       COALESCE((SELECT SUM(oi.qty) FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE oi.variant_id = v.id AND o.status != 'cancelled'
         AND o.created_at >= datetime('now','-30 days')), 0) AS sold30
     FROM variants v JOIN products p ON p.id = v.product_id
     WHERE p.status != 'archived' ${low ? "AND v.stock <= 5" : ""} ORDER BY v.stock ASC, p.sort, v.position`,
  );
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        title="Inventory"
        sub="Set exact stock, or add a delivery to what's on the shelf. Days of cover uses the last 30 days of sales."
        actions={
          <Link href={`${base}/inventory${low ? "" : "?filter=low"}`} className={btnSecondary}>
            {low ? "Show all" : "Show low stock only"}
          </Link>
        }
      />
      <Card pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-left text-[13.5px]">
            <thead className="border-b border-black/[0.06] text-[12px] text-muted">
              <tr>
                <th className="px-5 py-2.5 font-medium">Product</th>
                <th className="px-3 py-2.5 font-medium">SKU</th>
                <th className="px-3 py-2.5 font-medium">Sold (30d)</th>
                <th className="px-3 py-2.5 font-medium">Days of cover</th>
                <th className="px-3 py-2.5 font-medium">In stock</th>
                <th className="px-5 py-2.5 font-medium">Update</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {rows.map((v) => {
                const perDay = v.sold30 / 30;
                const cover = perDay > 0 ? Math.floor(v.stock / perDay) : null;
                return (
                  <tr key={v.id}>
                    <td className="px-5 py-2.5">
                      <Link href={`${base}/products/${v.product_id}`} className="font-medium hover:underline">
                        {v.title}
                      </Link>
                      <span className="text-muted"> · {v.vtitle}</span>
                      {v.status === "draft" && <span className="ml-2"><Badge tone="amber">Draft</Badge></span>}
                    </td>
                    <td className="px-3 py-2.5 font-mono text-[12px] text-muted">{v.sku}</td>
                    <td className="px-3 py-2.5 tabular-nums">{v.sold30}</td>
                    <td className="px-3 py-2.5">{cover == null ? <span className="text-muted">—</span> : <Badge tone={cover < 14 ? "red" : cover < 30 ? "amber" : "green"}>{cover} days</Badge>}</td>
                    <td className="px-3 py-2.5">
                      <Badge tone={v.stock === 0 ? "red" : v.stock <= 5 ? "amber" : "grey"}>{v.stock}</Badge>
                    </td>
                    <td className="px-5 py-2">
                      <form action={setStock} className="flex items-center gap-1.5">
                        <input type="hidden" name="id" value={v.id} />
                        <select name="mode" className={`${field} w-24 py-1.5`}>
                          <option value="add">Add</option>
                          <option value="set">Set to</option>
                        </select>
                        <input name="value" type="number" defaultValue={0} className={`${field} w-20 py-1.5`} />
                        <button className={`${btnSecondary} py-1.5`}>Save</button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
