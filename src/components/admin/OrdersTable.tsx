import Link from "next/link";
import { Badge, dateTime, fulfilLabel, fulfilTone, paymentTone } from "./ui";
import { formatINR } from "@/lib/utils";

export default function OrdersTable({
  base,
  rows,
}: {
  base: string;
  rows: { id: number; number: string; name: string; total: number; payment_status: string; fulfillment_status: string; created_at: string; status: string; items?: number; is_sample?: number }[];
}) {
  if (!rows.length) return <p className="p-5 text-[13.5px] text-muted">No orders yet. When customers check out, their orders appear here.</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[640px] text-left text-[13.5px]">
        <thead className="border-b border-black/[0.06] text-[12px] text-muted">
          <tr>
            <th className="px-5 py-2.5 font-medium">Order</th>
            <th className="px-3 py-2.5 font-medium">Date</th>
            <th className="px-3 py-2.5 font-medium">Customer</th>
            <th className="px-3 py-2.5 font-medium">Payment</th>
            <th className="px-3 py-2.5 font-medium">Fulfilment</th>
            <th className="px-5 py-2.5 text-right font-medium">Total</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-black/[0.05]">
          {rows.map((o) => (
            <tr key={o.id} className="hover:bg-[#FAF8F5]">
              <td className="px-5 py-3">
                <Link href={`${base}/orders/${o.id}`} className="font-medium hover:underline">
                  #{o.number}
                </Link>
                {o.is_sample ? <span className="ml-2 text-[10.5px] text-muted">SAMPLE</span> : null}
              </td>
              <td className="px-3 py-3 text-muted">{dateTime(o.created_at)}</td>
              <td className="px-3 py-3">{o.name}</td>
              <td className="px-3 py-3">
                {o.status === "cancelled" ? <Badge tone="grey">Cancelled</Badge> : <Badge tone={paymentTone(o.payment_status)}>{o.payment_status === "paid" ? "Paid" : o.payment_status === "refunded" ? "Refunded" : "Pending"}</Badge>}
              </td>
              <td className="px-3 py-3">{o.status !== "cancelled" && <Badge tone={fulfilTone(o.fulfillment_status)}>{fulfilLabel[o.fulfillment_status]}</Badge>}</td>
              <td className="px-5 py-3 text-right tabular-nums">{formatINR(o.total)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
