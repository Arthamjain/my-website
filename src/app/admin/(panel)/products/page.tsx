import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import { adminBase } from "@/lib/auth";
import { all } from "@/lib/db";
import { CATEGORIES } from "@/lib/catalog";
import { Badge, Card, PageHeader, Tabs, btnPrimary, field } from "@/components/admin/ui";
import { formatINR } from "@/lib/utils";

export default async function ProductsPage({ searchParams }: PageProps<"/admin/products">) {
  const sp = await searchParams;
  const base = adminBase();
  const status = typeof sp.status === "string" ? sp.status : "";
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const where = ["1=1"];
  const args: string[] = [];
  if (status) {
    where.push("p.status = ?");
    args.push(status);
  }
  if (q) {
    where.push("(p.title LIKE ? OR p.tags LIKE ? OR p.slug LIKE ?)");
    args.push(`%${q}%`, `%${q}%`, `%${q}%`);
  }
  const rows = await all<{ id: number; title: string; slug: string; status: string; category: string; price: number; image: string; stock: number; variants: number; sold: number }>(
    `SELECT p.id, p.title, p.slug, p.status, p.category, p.price,
       COALESCE((SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY position LIMIT 1), '') AS image,
       COALESCE((SELECT SUM(stock) FROM variants v WHERE v.product_id = p.id), 0) AS stock,
       (SELECT COUNT(*) FROM variants v WHERE v.product_id = p.id) AS variants,
       COALESCE((SELECT SUM(qty) FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE oi.product_id = p.id AND o.status != 'cancelled'), 0) AS sold
     FROM products p WHERE ${where.join(" AND ")} ORDER BY p.sort, p.id`,
    args,
  );
  const tabs = [
    ["", "All"],
    ["active", "Active"],
    ["draft", "Draft"],
    ["archived", "Archived"],
  ];
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        title="Products"
        sub={`${rows.length} product${rows.length === 1 ? "" : "s"}`}
        actions={
          <Link href={`${base}/products/new`} className={btnPrimary}>
            <Plus size={15} /> Add product
          </Link>
        }
      />
      <Tabs items={tabs.map(([k, l]) => ({ href: `${base}/products${k ? `?status=${k}` : ""}`, label: l }))} active={tabs.find(([k]) => k === status)?.[1] ?? "All"} />
      <Card pad={false}>
        <form className="border-b border-black/[0.06] p-3" action={`${base}/products`}>
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="Search products" className={field} />
        </form>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-[13.5px]">
            <thead className="border-b border-black/[0.06] text-[12px] text-muted">
              <tr>
                <th className="px-5 py-2.5 font-medium">Product</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-3 py-2.5 font-medium">Inventory</th>
                <th className="px-3 py-2.5 font-medium">Category</th>
                <th className="px-3 py-2.5 font-medium">Sold</th>
                <th className="px-5 py-2.5 text-right font-medium">Price</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {rows.map((p) => (
                <tr key={p.id} className="hover:bg-[#FAF8F5]">
                  <td className="px-5 py-2.5">
                    <Link href={`${base}/products/${p.id}`} className="flex items-center gap-3 font-medium hover:underline">
                      <span className="relative h-12 w-10 shrink-0 overflow-hidden rounded-md bg-[#F1ECE3]">
                        {p.image && <Image src={p.image} alt="" fill sizes="40px" className="object-contain" />}
                      </span>
                      {p.title}
                    </Link>
                  </td>
                  <td className="px-3 py-2.5">
                    <Badge tone={p.status === "active" ? "green" : p.status === "draft" ? "amber" : "grey"}>{p.status[0].toUpperCase() + p.status.slice(1)}</Badge>
                  </td>
                  <td className={`px-3 py-2.5 ${p.stock <= 5 ? "text-bad" : ""}`}>
                    {p.stock} in stock{p.variants > 1 && <span className="text-muted"> · {p.variants} variants</span>}
                  </td>
                  <td className="px-3 py-2.5 text-muted">{CATEGORIES.find((c) => c.id === p.category)?.label ?? p.category}</td>
                  <td className="px-3 py-2.5 tabular-nums">{p.sold}</td>
                  <td className="px-5 py-2.5 text-right tabular-nums">{formatINR(p.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
