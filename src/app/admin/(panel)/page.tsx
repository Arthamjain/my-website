import Link from "next/link";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { dashboardStats } from "@/lib/analytics";
import { adminBase } from "@/lib/auth";
import { get } from "@/lib/db";
import { AreaChart, Funnel, Bars } from "@/components/admin/Charts";
import { Badge, Card, PageHeader } from "@/components/admin/ui";
import OrdersTable from "@/components/admin/OrdersTable";
import { paymentLabel } from "@/lib/orders";
import { cn, formatINR } from "@/lib/utils";

function Stat({ label, value, change, hint }: { label: string; value: string; change?: number | null; hint?: string }) {
  return (
    <div className="rounded-xl border border-black/[0.07] bg-white p-5">
      <p className="text-[12.5px] text-muted">{label}</p>
      <p className="mt-2 text-[26px] font-semibold tracking-tight tabular-nums">{value}</p>
      <p className="mt-1 flex items-center gap-1 text-[12px]">
        {change != null ? (
          <span className={cn("flex items-center gap-0.5", change >= 0 ? "text-ok" : "text-bad")}>
            {change >= 0 ? <ArrowUpRight size={13} /> : <ArrowDownRight size={13} />}
            {Math.abs(change).toFixed(0)}%
          </span>
        ) : null}
        <span className="text-muted">{hint ?? (change != null ? "vs previous period" : "")}</span>
      </p>
    </div>
  );
}

export default async function Dashboard({ searchParams }: PageProps<"/admin">) {
  const sp = await searchParams;
  const days = [7, 30, 90].includes(Number(sp.days)) ? Number(sp.days) : 30;
  const base = adminBase();
  const [s, sample] = await Promise.all([dashboardStats(days), get<{ n: number }>("SELECT COUNT(*) AS n FROM orders WHERE is_sample = 1")]);
  const hasSample = Number(sample?.n) > 0;

  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        title="Dashboard"
        sub={`Last ${days} days`}
        actions={
          <div className="flex rounded-lg border border-black/10 bg-white p-0.5 text-[13px]">
            {[7, 30, 90].map((d) => (
              <Link key={d} href={`${base}?days=${d}`} className={cn("rounded-md px-3 py-1.5", d === days ? "bg-ink text-white" : "text-muted hover:text-ink")}>
                {d}d
              </Link>
            ))}
          </div>
        }
      />

      {hasSample && (
        <p className="mb-4 rounded-lg bg-[#FBEFD5] px-4 py-2.5 text-[13px] text-[#80570F]">
          You&apos;re looking at <strong>sample data</strong>. Remove it in <Link href={`${base}/settings`} className="underline">Settings</Link> before going live.
        </p>
      )}

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat label="Revenue" value={formatINR(s.revenue)} change={s.change.revenue} />
        <Stat label="Orders" value={s.orders.toLocaleString("en-IN")} change={s.change.orders} />
        <Stat label="Average order value" value={formatINR(s.aov)} hint="per order" />
        <Stat label="Conversion rate" value={`${s.conversion.toFixed(2)}%`} hint={`${s.visitors.toLocaleString("en-IN")} visitors`} />
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card title="Sales over time" action={<span className="text-[12.5px] text-muted">{formatINR(s.revenue)}</span>}>
          <AreaChart data={s.series} valueKey="revenue" />
        </Card>
        <Card title="Shopper funnel">
          <Funnel steps={s.funnel} />
          <p className="mt-4 text-[12px] text-muted">Unique visits reaching each step. Percentages compare with the step above.</p>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card
          title="Needs attention"
          className="lg:col-span-1"
          action={
            <Link href={`${base}/orders?tab=unfulfilled`} className="text-[12.5px] underline">
              View
            </Link>
          }
        >
          <p className="text-[32px] font-semibold tabular-nums">{s.unfulfilled}</p>
          <p className="text-[13px] text-muted">open orders waiting to be packed or shipped</p>
          <div className="mt-5 border-t border-black/[0.06] pt-4">
            <p className="mb-2 text-[12.5px] font-medium">Low stock</p>
            <ul className="space-y-1.5 text-[13px]">
              {s.lowStock.map((v) => (
                <li key={v.id} className="flex justify-between gap-3">
                  <Link href={`${base}/products/${v.product_id}`} className="truncate hover:underline">
                    {v.title} <span className="text-muted">· {v.vtitle}</span>
                  </Link>
                  <Badge tone={v.stock === 0 ? "red" : "amber"}>{v.stock}</Badge>
                </li>
              ))}
              {s.lowStock.length === 0 && <li className="text-muted">Everything is well stocked.</li>}
            </ul>
          </div>
        </Card>
        <Card title="Top products">
          <Bars rows={s.top.map((t) => ({ label: `${t.title} (${t.units})`, value: t.revenue }))} format="inr" />
        </Card>
        <Card title="Payment methods">
          <Bars rows={s.byPayment.map((p) => ({ label: `${paymentLabel(p.payment_method)} · ${p.n} orders`, value: Number(p.revenue) }))} format="inr" />
        </Card>
      </div>

      <Card
        title="Recent orders"
        className="mt-4"
        pad={false}
        action={
          <Link href={`${base}/orders`} className="text-[12.5px] underline">
            All orders
          </Link>
        }
      >
        <OrdersTable base={base} rows={s.recent} />
      </Card>
    </div>
  );
}
