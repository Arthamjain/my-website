"use client";

import Image from "next/image";
import Link from "next/link";
import { cartSubtotal, useCart } from "@/store/cart";
import { FreeShippingBar, QtyStepper } from "@/components/store/CartDrawer";
import { formatINR } from "@/lib/utils";
import { useHydrated } from "@/lib/useHydrated";

export default function CartView({ threshold }: { threshold: number }) {
  const { items, setQty, remove } = useCart();
  const mounted = useHydrated();
  if (!mounted) return <div className="min-h-[50vh]" />;
  const subtotal = cartSubtotal(items);

  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-10 md:px-8 md:pt-14">
      <h1 className="h1">Your bag</h1>
      {items.length === 0 ? (
        <div className="py-20 text-center">
          <p className="hand text-3xl text-muted">Nothing here yet.</p>
          <Link href="/shop" className="btn btn-primary mt-6">
            Browse journals
          </Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-10 md:grid-cols-[1fr_340px]">
          <ul className="divide-y divide-line border-y border-line">
            {items.map((i) => (
              <li key={i.variantId} className="flex gap-5 py-6">
                <Link href={`/products/${i.slug}`} className="card-photo relative h-32 w-28 shrink-0 overflow-hidden rounded-xl">
                  {i.image && <Image src={i.image} alt="" fill sizes="112px" className="object-contain p-2" />}
                </Link>
                <div className="flex flex-1 flex-col">
                  <div className="flex justify-between gap-4">
                    <div>
                      <Link href={`/products/${i.slug}`} className="font-medium hover:underline">
                        {i.title}
                      </Link>
                      <p className="text-[13.5px] text-muted">{i.variantTitle}</p>
                      <p className="mt-1 text-[13.5px] text-muted">{formatINR(i.price)} each</p>
                    </div>
                    <p className="tabular-nums">{formatINR(i.price * i.qty)}</p>
                  </div>
                  <div className="mt-auto flex items-center gap-5 pt-3">
                    <QtyStepper small qty={i.qty} onChange={(q) => setQty(i.variantId, q)} />
                    <button onClick={() => remove(i.variantId)} className="text-[13px] text-muted hover:underline">
                      Remove
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <aside className="h-fit rounded-2xl bg-linen/70 p-6">
            <FreeShippingBar subtotal={subtotal} threshold={threshold} />
            <div className="mt-6 flex justify-between text-[15px]">
              <span>Subtotal</span>
              <span className="font-medium tabular-nums">{formatINR(subtotal)}</span>
            </div>
            <p className="mt-1 text-[12.5px] text-muted">Taxes included. Shipping and codes at checkout.</p>
            <Link href="/checkout" className="btn btn-primary mt-5 w-full">
              Checkout
            </Link>
            <Link href="/shop" className="mt-3 block text-center text-[13px] text-muted hover:underline">
              Continue shopping
            </Link>
          </aside>
        </div>
      )}
    </div>
  );
}
