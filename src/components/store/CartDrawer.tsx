"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";
import { Minus, Plus, X } from "lucide-react";
import { cartSubtotal, useCart } from "@/store/cart";
import { cn, formatINR } from "@/lib/utils";
import { useHydrated } from "@/lib/useHydrated";

export function FreeShippingBar({ subtotal, threshold }: { subtotal: number; threshold: number }) {
  if (!threshold) return null;
  const left = Math.max(0, threshold - subtotal);
  const pct = Math.min(100, (subtotal / threshold) * 100);
  return (
    <div>
      <p className="text-[13px]">
        {left > 0 ? (
          <>
            You&apos;re <strong className="font-semibold">{formatINR(left)}</strong> away from free shipping.
          </>
        ) : (
          <>Your order ships free.</>
        )}
      </p>
      <div className="mt-2 h-[3px] overflow-hidden rounded-full bg-sand">
        <div className="h-full rounded-full bg-moss transition-[width] duration-700" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

export function QtyStepper({ qty, onChange, small }: { qty: number; onChange: (q: number) => void; small?: boolean }) {
  return (
    <div className={cn("inline-flex items-center rounded-full border border-line bg-white", small ? "h-8" : "h-11")}>
      <button className="grid h-full w-8 place-items-center text-muted hover:text-ink" onClick={() => onChange(qty - 1)} aria-label="Decrease quantity">
        <Minus size={14} />
      </button>
      <span className="w-6 text-center text-[13px] tabular-nums">{qty}</span>
      <button className="grid h-full w-8 place-items-center text-muted hover:text-ink" onClick={() => onChange(qty + 1)} aria-label="Increase quantity">
        <Plus size={14} />
      </button>
    </div>
  );
}

export default function CartDrawer({ threshold }: { threshold: number }) {
  const { items, open, setOpen, setQty, remove } = useCart();
  const mounted = useHydrated();
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setOpen]);
  if (!mounted) return null;
  const subtotal = cartSubtotal(items);

  return (
    <div className={cn("fixed inset-0 z-[60]", open ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!open}>
      <div className={cn("absolute inset-0 bg-ink/30 transition-opacity duration-300", open ? "opacity-100" : "opacity-0")} onClick={() => setOpen(false)} />
      <aside
        role="dialog"
        aria-label="Your bag"
        className={cn(
          "absolute inset-y-0 right-0 flex w-full max-w-[440px] flex-col bg-paper shadow-2xl transition-transform duration-500",
          open ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex items-center justify-between border-b border-line px-6 py-5">
          <h2 className="font-serif text-2xl">Your bag</h2>
          <button onClick={() => setOpen(false)} aria-label="Close bag" className="rounded-full p-1.5 hover:bg-linen">
            <X size={20} strokeWidth={1.5} />
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center px-8 text-center">
            <p className="hand text-3xl text-muted">Nothing here yet.</p>
            <p className="mt-2 text-[14px] text-muted">Every journal starts with a single page.</p>
            <Link href="/shop" onClick={() => setOpen(false)} className="btn btn-primary mt-6">
              Browse journals
            </Link>
          </div>
        ) : (
          <>
            <div className="border-b border-line px-6 py-4">
              <FreeShippingBar subtotal={subtotal} threshold={threshold} />
            </div>
            <ul className="flex-1 divide-y divide-line overflow-y-auto px-6">
              {items.map((i) => (
                <li key={i.variantId} className="flex gap-4 py-5">
                  <Link href={`/products/${i.slug}`} onClick={() => setOpen(false)} className="card-photo relative h-24 w-20 shrink-0 overflow-hidden rounded-lg">
                    {i.image && <Image src={i.image} alt="" fill sizes="80px" className="object-contain p-1.5" />}
                  </Link>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-[14.5px] font-medium">{i.title}</p>
                        <p className="text-[13px] text-muted">{i.variantTitle}</p>
                      </div>
                      <p className="text-[14px] tabular-nums">{formatINR(i.price * i.qty)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between pt-2">
                      <QtyStepper small qty={i.qty} onChange={(q) => setQty(i.variantId, q)} />
                      <button onClick={() => remove(i.variantId)} className="text-[12.5px] text-muted underline-offset-2 hover:underline">
                        Remove
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
            <div className="border-t border-line px-6 py-5">
              <div className="flex justify-between text-[15px]">
                <span>Subtotal</span>
                <span className="font-medium tabular-nums">{formatINR(subtotal)}</span>
              </div>
              <p className="mt-1 text-[12.5px] text-muted">Taxes included. Shipping and discount codes at checkout.</p>
              <Link href="/checkout" onClick={() => setOpen(false)} className="btn btn-primary mt-4 w-full">
                Checkout · {formatINR(subtotal)}
              </Link>
              <Link href="/cart" onClick={() => setOpen(false)} className="mt-3 block text-center text-[13px] text-muted underline-offset-2 hover:underline">
                View full bag
              </Link>
              <p className="mt-4 flex justify-center gap-4 text-[11.5px] text-muted">
                <span>Cash on delivery</span>·<span>UPI & cards</span>·<span>7-day returns</span>
              </p>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
