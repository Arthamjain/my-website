import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { adminBase } from "@/lib/auth";
import { getOrderFull, paymentLabel } from "@/lib/orders";
import { updateOrder } from "../../../actions";
import { Badge, Card, btnDanger, btnPrimary, btnSecondary, dateTime, field, fulfilLabel, fulfilTone, paymentTone } from "@/components/admin/ui";
import PrintButton from "@/components/admin/PrintButton";
import { formatINR } from "@/lib/utils";

function Op({ id, op, label, cls = btnSecondary, children }: { id: number; op: string; label: string; cls?: string; children?: React.ReactNode }) {
  return (
    <form action={updateOrder} className="contents">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="op" value={op} />
      {children}
      <button className={cls}>{label}</button>
    </form>
  );
}

export default async function OrderDetail({ params }: PageProps<"/admin/orders/[id]">) {
  const { id } = await params;
  const o = await getOrderFull({ id: Number(id) });
  if (!o) notFound();
  const base = adminBase();
  const cancelled = o.status === "cancelled";
  const units = o.items.reduce((n, i) => n + i.qty, 0);

  return (
    <div className="mx-auto max-w-[1100px]">
      <Link href={`${base}/orders`} className="mb-3 inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink print:hidden">
        <ArrowLeft size={14} /> Orders
      </Link>
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <h1 className="text-[24px] font-semibold tracking-tight">#{o.number}</h1>
        {cancelled ? <Badge tone="grey">Cancelled</Badge> : <Badge tone={paymentTone(o.payment_status)}>{o.payment_status === "paid" ? "Paid" : o.payment_status === "refunded" ? "Refunded" : "Payment pending"}</Badge>}
        {!cancelled && <Badge tone={fulfilTone(o.fulfillment_status)}>{fulfilLabel[o.fulfillment_status]}</Badge>}
        {o.is_sample ? <Badge tone="amber">Sample</Badge> : null}
        <span className="text-[13px] text-muted">{dateTime(o.created_at)}</span>
        <div className="ml-auto print:hidden">
          <PrintButton />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <Card title={`${units} item${units > 1 ? "s" : ""}`}>
            <ul className="divide-y divide-black/[0.05]">
              {o.items.map((i) => (
                <li key={i.id} className="flex items-center gap-4 py-3 first:pt-0">
                  <div className="relative h-14 w-12 shrink-0 rounded-md bg-[#F1ECE3]">{i.image && <Image src={i.image} alt="" fill sizes="48px" className="object-contain p-0.5" />}</div>
                  <div className="min-w-0 flex-1">
                    {i.product_id ? (
                      <Link href={`${base}/products/${i.product_id}`} className="font-medium hover:underline">
                        {i.title}
                      </Link>
                    ) : (
                      <p className="font-medium">{i.title}</p>
                    )}
                    <p className="text-[12.5px] text-muted">
                      {i.variant_title} {i.sku && `· ${i.sku}`}
                    </p>
                  </div>
                  <p className="text-[13px] text-muted tabular-nums">
                    {formatINR(i.price)} × {i.qty}
                  </p>
                  <p className="w-20 text-right tabular-nums">{formatINR(i.price * i.qty)}</p>
                </li>
              ))}
            </ul>
            {!cancelled && (
              <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-black/[0.06] pt-4 print:hidden">
                {o.fulfillment_status === "unfulfilled" && <Op id={o.id} op="packed" label="Mark as packed" cls={btnPrimary} />}
                {["unfulfilled", "packed"].includes(o.fulfillment_status) && (
                  <form action={updateOrder} className="flex flex-wrap items-end gap-2">
                    <input type="hidden" name="id" value={o.id} />
                    <input type="hidden" name="op" value="shipped" />
                    <input name="carrier" placeholder="Courier (e.g. Delhivery)" className={`${field} w-44`} />
                    <input name="tracking" placeholder="Tracking number" className={`${field} w-44`} />
                    <button className={o.fulfillment_status === "packed" ? btnPrimary : btnSecondary}>Mark as shipped</button>
                  </form>
                )}
                {o.fulfillment_status === "shipped" && <Op id={o.id} op="delivered" label="Mark as delivered" cls={btnPrimary} />}
              </div>
            )}
          </Card>

          <Card title="Payment">
            <dl className="space-y-1.5 text-[13.5px]">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="tabular-nums">{formatINR(o.subtotal)}</dd>
              </div>
              {o.discount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">Discount {o.discount_code && <Badge>{o.discount_code}</Badge>}</dt>
                  <dd className="tabular-nums">− {formatINR(o.discount)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Shipping ({o.shipping_method})</dt>
                <dd className="tabular-nums">{o.shipping ? formatINR(o.shipping) : "Free"}</dd>
              </div>
              {o.cod_fee > 0 && (
                <div className="flex justify-between">
                  <dt className="text-muted">COD fee</dt>
                  <dd className="tabular-nums">{formatINR(o.cod_fee)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-black/[0.06] pt-2 text-[15px] font-semibold">
                <dt>Total</dt>
                <dd className="tabular-nums">{formatINR(o.total)}</dd>
              </div>
              <div className="flex justify-between text-[12.5px] text-muted">
                <dt>GST included</dt>
                <dd>{formatINR(o.tax)}</dd>
              </div>
              <div className="flex justify-between pt-1">
                <dt className="text-muted">Method</dt>
                <dd>{paymentLabel(o.payment_method)}</dd>
              </div>
            </dl>
            {!cancelled && (
              <div className="mt-4 flex flex-wrap gap-2 border-t border-black/[0.06] pt-4 print:hidden">
                {o.payment_status === "pending" && <Op id={o.id} op="paid" label="Mark as paid" cls={btnPrimary} />}
                {o.payment_status === "paid" && (
                  <Op id={o.id} op="refund" label="Refund">
                    <label className="flex items-center gap-1.5 text-[13px] text-muted">
                      <input type="checkbox" name="restock" defaultChecked /> Restock items
                    </label>
                  </Op>
                )}
              </div>
            )}
          </Card>

          <Card title="Timeline">
            <form action={updateOrder} className="mb-4 flex gap-2 print:hidden">
              <input type="hidden" name="id" value={o.id} />
              <input type="hidden" name="op" value="note" />
              <input name="note" placeholder="Add an internal note…" className={field} />
              <button className={btnSecondary}>Add</button>
            </form>
            <ol className="relative space-y-4 border-l border-black/10 pl-5">
              {o.events.map((e) => (
                <li key={e.id} className="relative text-[13.5px]">
                  <span className="absolute -left-[25px] top-1.5 h-2 w-2 rounded-full bg-ink/40" />
                  <p>{e.message}</p>
                  <p className="text-[12px] text-muted">{dateTime(e.created_at)}</p>
                </li>
              ))}
            </ol>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Customer">
            <p className="font-medium">{o.name}</p>
            <a href={`mailto:${o.email}`} className="block text-[13.5px] text-indigo hover:underline">
              {o.email}
            </a>
            <a href={`tel:${o.phone}`} className="block text-[13.5px] text-muted">
              {o.phone}
            </a>
            {o.customer_id && (
              <Link href={`${base}/customers/${o.customer_id}`} className="mt-2 inline-block text-[13px] underline print:hidden">
                View customer
              </Link>
            )}
          </Card>
          <Card title="Shipping address">
            <p className="text-[13.5px] leading-relaxed">
              {o.name}
              <br />
              {o.address.line1}
              {o.address.line2 && (
                <>
                  <br />
                  {o.address.line2}
                </>
              )}
              <br />
              {o.address.city}, {o.address.state} {o.address.pincode}
              <br />
              {o.address.country}
            </p>
            {o.tracking_number && (
              <p className="mt-3 text-[13px]">
                {o.carrier} · <span className="font-mono">{o.tracking_number}</span>
              </p>
            )}
          </Card>
          {(o.note || o.gift_message) && (
            <Card title="Notes from customer">
              {o.note && <p className="text-[13.5px]">{o.note}</p>}
              {o.gift_message && (
                <p className="mt-2 rounded-lg bg-[#F6F1E7] p-3 text-[13.5px]">
                  <span className="block text-[11.5px] font-medium uppercase tracking-wide text-muted">Gift message</span>
                  {o.gift_message}
                </p>
              )}
            </Card>
          )}
          <Card title="More actions" className="print:hidden">
            <div className="flex flex-wrap gap-2">
              {cancelled ? <Op id={o.id} op="reopen" label="Reopen order" /> : <Op id={o.id} op="cancel" label="Cancel order" cls={btnDanger} />}
            </div>
            <p className="mt-3 text-[12px] text-muted">Cancelling returns the items to stock. Refund online payments separately with your payment provider.</p>
          </Card>
        </div>
      </div>
    </div>
  );
}
