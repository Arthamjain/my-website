import Link from "next/link";
import { adminBase } from "@/lib/auth";
import { dashboardStats, trafficStats } from "@/lib/analytics";
import { AreaChart, Bars, Funnel } from "@/components/admin/Charts";
import { Card, PageHeader } from "@/components/admin/ui";
import { cn, formatINR } from "@/lib/utils";

export default async function AnalyticsPage({ searchParams }: PageProps<"/admin/analytics">) {
  const sp = await searchParams;
  const days = [7, 30, 90].includes(Number(sp.days)) ? Number(sp.days) : 30;
  const base = adminBase();
  const [t, d] = await Promise.all([trafficStats(days), dashboardStats(days)]);
  const totalViews = t.series.reduce((n, x) => n + x.views, 0);
  return (
    <div className="mx-auto max-w-[1200px]">
      <PageHeader
        title="Analytics"
        sub="Anonymous visit tracking from your own store — no third-party scripts."
        actions={
          <div className="flex rounded-lg border border-black/10 bg-white p-0.5 text-[13px]">
            {[7, 30, 90].map((x) => (
              <Link key={x} href={`${base}/analytics?days=${x}`} className={cn("rounded-md px-3 py-1.5", x === days ? "bg-ink text-white" : "text-muted hover:text-ink")}>
                {x}d
              </Link>
            ))}
          </div>
        }
      />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[
          ["Visitors", d.visitors.toLocaleString("en-IN")],
          ["Page views", totalViews.toLocaleString("en-IN")],
          ["Conversion rate", `${d.conversion.toFixed(2)}%`],
          ["Revenue per visitor", formatINR(d.visitors ? Math.round(d.revenue / d.visitors) : 0)],
        ].map(([l, v]) => (
          <div key={l} className="rounded-xl border border-black/[0.07] bg-white p-5">
            <p className="text-[12.5px] text-muted">{l}</p>
            <p className="mt-2 text-[24px] font-semibold tabular-nums">{v}</p>
          </div>
        ))}
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <Card title="Visitors per day">
          <AreaChart data={t.series} valueKey="visitors" format="num" color="#2D4236" />
        </Card>
        <Card title="Shopper funnel">
          <Funnel steps={d.funnel} />
        </Card>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        <Card title="Top pages">
          <Bars rows={t.pages.map((p) => ({ label: p.path, value: Number(p.views) }))} />
        </Card>
        <Card title="Where visitors come from">
          <Bars rows={t.referrers.map((r) => ({ label: r.referrer, value: Number(r.visitors) }))} />
        </Card>
        <Card title="Devices">
          <Bars rows={t.devices.map((r) => ({ label: r.device, value: Number(r.visitors) }))} />
        </Card>
      </div>
      <Card title="Product performance" className="mt-4" pad={false}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[620px] text-left text-[13.5px]">
            <thead className="border-b border-black/[0.06] text-[12px] text-muted">
              <tr>
                <th className="px-5 py-2.5 font-medium">Product</th>
                <th className="px-3 py-2.5 font-medium">Views</th>
                <th className="px-3 py-2.5 font-medium">Added to bag</th>
                <th className="px-3 py-2.5 font-medium">Add rate</th>
                <th className="px-5 py-2.5 font-medium">Units sold</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-black/[0.05]">
              {t.products.map((p) => (
                <tr key={p.title}>
                  <td className="px-5 py-2.5 font-medium">{p.title}</td>
                  <td className="px-3 py-2.5 tabular-nums">{Number(p.views)}</td>
                  <td className="px-3 py-2.5 tabular-nums">{Number(p.adds)}</td>
                  <td className="px-3 py-2.5 tabular-nums">{p.views ? `${((Number(p.adds) / Number(p.views)) * 100).toFixed(1)}%` : "—"}</td>
                  <td className="px-5 py-2.5 tabular-nums">{Number(p.units)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
