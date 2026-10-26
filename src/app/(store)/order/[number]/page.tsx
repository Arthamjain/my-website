import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Check } from "lucide-react";
import { FULFILLMENT_STEPS, getOrderFull, paymentLabel } from "@/lib/orders";
import { getCustomer } from "@/lib/auth";
import { cn, formatINR } from "@/lib/utils";

export const metadata: Metadata = { title: "Your order", robots: { index: false } };

export default async function OrderPage({ params, searchParams }: PageProps<"/order/[number]">) {
  const { number } = await params;
  const sp = await searchParams;
  const o = await getOrderFull({ number });
  if (!o) notFound();
  const customer = await getCustomer();
  // Only the buyer (via the private link token, or their account) can see an order.
  if (sp.t !== o.token && customer?.id !== o.customer_id) notFound();

  const isNew = sp.new === "1";
  const cancelled = o.status === "cancelled";
  const stepIndex = FULFILLMENT_STEPS.findIndex((s) => s.id === o.fulfillment_status);
  const first = o.name.split(" ")[0];

  return (
    <div className="mx-auto max-w-[980px] px-4 pt-10 md:px-8 md:pt-14">
      {isNew ? (
        <div className="text-center">
          <p className="hand text-[40px] leading-none text-indigo md:text-[52px]">Thank you, {first}.</p>
          <h1 className="h2 mt-4">Order {o.number} is confirmed.</h1>
          <p className="mx-auto mt-3 max-w-lg text-[15px] text-muted">
            We&apos;ve sent the details to {o.email}. Your journal will be wrapped in muslin and leave the studio within one working day.
          </p>
        </div>
      ) : (
        <div>
          <p className="eyebrow">Order {o.number}</p>
          <h1 className="h1 mt-2">{cancelled ? "This order was cancelled" : `Hello ${first}, here's your order`}</h1>
        </div>
      )}

      {!cancelled && (
        <ol className="mt-12 grid grid-cols-4 gap-2">
          {FULFILLMENT_STEPS.map((s, i) => (
            <li key={s.id} className="flex flex-col items-center text-center">
              <div className="flex w-full items-center">
                <div className={cn("h-[2px] flex-1", i === 0 ? "bg-transparent" : i <= stepIndex ? "bg-moss" : "bg-sand")} />
                <span className={cn("grid h-8 w-8 place-items-center rounded-full text-[12px]", i <= stepIndex ? "bg-moss text-white" : "bg-sand text-muted")}>
                  {i <= stepIndex ? <Check size={15} /> : i + 1}
                </span>
                <div className={cn("h-[2px] flex-1", i === FULFILLMENT_STEPS.length - 1 ? "bg-transparent" : i < stepIndex ? "bg-moss" : "bg-sand")} />
              </div>
              <p className={cn("mt-2 text-[12.5px]", i <= stepIndex ? "text-ink" : "text-muted")}>{s.label}</p>
            </li>
          ))}
        </ol>
      )}
      {o.tracking_number && (
        <p className="mt-6 text-center text-[14px]">
          Shipped with {o.carrier || "our courier"} · tracking number <strong className="font-medium">{o.tracking_number}</strong>
        </p>
      )}

      <div className="mt-12 grid gap-8 md:grid-cols-[1fr_320px]">
        <div className="rounded-2xl border border-line bg-white p-6">
          <ul className="divide-y divide-line">
            {o.items.map((i) => (
              <li key={i.id} className="flex gap-4 py-4 first:pt-0">
                <div className="card-photo relative h-20 w-16 shrink-0 rounded-lg">
                  {i.image && <Image src={i.image} alt="" fill sizes="64px" className="object-contain p-1" />}
                </div>
                <div className="flex-1 text-[14px]">
                  <p className="font-medium">{i.title}</p>
                  <p className="text-muted">
                    {i.variant_title} · Qty {i.qty}
                  </p>
                </div>
                <p className="text-[14px] tabular-nums">{formatINR(i.price * i.qty)}</p>
              </li>
            ))}
          </ul>
          <dl className="mt-4 space-y-1.5 border-t border-line pt-4 text-[14px]">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd>{formatINR(o.subtotal)}</dd>
            </div>
            {o.discount > 0 && (
              <div className="flex justify-between text-ok">
                <dt>Discount {o.discount_code && `(${o.discount_code})`}</dt>
                <dd>− {formatINR(o.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd>{o.shipping ? formatINR(o.shipping) : "Free"}</dd>
            </div>
            {o.cod_fee > 0 && (
              <div className="flex justify-between">
                <dt>Cash on delivery fee</dt>
                <dd>{formatINR(o.cod_fee)}</dd>
              </div>
            )}
            <div className="flex justify-between pt-2 text-[16px] font-medium">
              <dt>Total</dt>
              <dd>{formatINR(o.total)}</dd>
            </div>
          </dl>
        </div>
        <div className="space-y-6 text-[14px]">
          <div>
            <p className="eyebrow">Delivering to</p>
            <p className="mt-2 leading-relaxed">
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
              {o.phone}
            </p>
          </div>
          <div>
            <p className="eyebrow">Payment</p>
            <p className="mt-2">
              {paymentLabel(o.payment_method)} · {o.payment_status === "paid" ? "Paid" : o.payment_method === "cod" ? `Pay ${formatINR(o.total)} on delivery` : o.payment_status}
            </p>
          </div>
          {o.gift_message && (
            <div>
              <p className="eyebrow">Gift note</p>
              <p className="hand mt-2 text-[22px] leading-snug">{o.gift_message}</p>
            </div>
          )}
          <div className="rounded-xl bg-linen p-4 text-[13.5px]">
            Questions? Reply to your confirmation email or{" "}
            <Link href="/contact" className="underline">
              write to us
            </Link>{" "}
            with your order number.
          </div>
        </div>
      </div>
      <div className="mt-12 text-center">
        <Link href="/shop" className="btn btn-ghost">
          Keep browsing
        </Link>
      </div>
    </div>
  );
}
