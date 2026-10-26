import { all } from "@/lib/db";
import { deleteDiscount, toggleDiscount } from "../../actions";
import DiscountForm from "@/components/admin/DiscountForm";
import { Badge, Card, PageHeader, btnSecondary, dateOnly } from "@/components/admin/ui";
import { formatINR } from "@/lib/utils";

export default async function DiscountsPage() {
  const rows = await all<{ id: number; code: string; kind: string; value: number; min_subtotal: number; usage_limit: number | null; used: number; ends_at: string | null; active: number }>(
    "SELECT * FROM discounts ORDER BY active DESC, id DESC",
  );
  const now = new Date().toISOString();
  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader title="Discounts" sub="Codes shoppers type at checkout." />
      <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
        <Card pad={false}>
          <table className="w-full text-left text-[13.5px]">
            <thead className="border-b border-black/[0.06] text-[12px] text-muted">
              <tr>
                <th className="px-5 py-2.5 font-medium">Code</th>
                <th className="px-3 py-2.5 font-medium">Offer</th>
                <th className="px-3 py-2.5 font-medium">Used</th>
                <th className="px-3 py-2.5 font-medium">Status</th>
                <th className="px-5 py-2.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {rows.map((d) => {
                const expired = d.ends_at && d.ends_at < now;
                const usedUp = d.usage_limit != null && d.used >= d.usage_limit;
                return (
                  <tr key={d.id}>
                    <td className="px-5 py-3 font-mono font-medium">{d.code}</td>
                    <td className="px-3 py-3">
                      {d.kind === "percent" ? `${d.value}% off` : d.kind === "fixed" ? `${formatINR(d.value)} off` : "Free shipping"}
                      <p className="text-[12px] text-muted">
                        {d.min_subtotal ? `Over ${formatINR(d.min_subtotal)}` : "Any order"}
                        {d.ends_at ? ` · until ${dateOnly(d.ends_at)}` : ""}
                      </p>
                    </td>
                    <td className="px-3 py-3 tabular-nums">
                      {d.used}
                      {d.usage_limit != null && <span className="text-muted"> / {d.usage_limit}</span>}
                    </td>
                    <td className="px-3 py-3">
                      {!d.active ? <Badge>Paused</Badge> : expired ? <Badge tone="red">Expired</Badge> : usedUp ? <Badge tone="amber">Used up</Badge> : <Badge tone="green">Active</Badge>}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1.5">
                        <form action={toggleDiscount}>
                          <input type="hidden" name="id" value={d.id} />
                          <button className={`${btnSecondary} px-2.5 py-1 text-[12.5px]`}>{d.active ? "Pause" : "Resume"}</button>
                        </form>
                        <form action={deleteDiscount}>
                          <input type="hidden" name="id" value={d.id} />
                          <button className={`${btnSecondary} px-2.5 py-1 text-[12.5px] text-bad`}>Delete</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-6 text-muted">
                    No codes yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
        <Card title="Create a code">
          <DiscountForm />
        </Card>
      </div>
    </div>
  );
}
