"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Truck, RotateCcw, Banknote } from "lucide-react";
import { track, useCart } from "@/store/cart";
import { QtyStepper } from "./CartDrawer";
import { cn, formatINR } from "@/lib/utils";

type V = { id: number; title: string; format: string; ruling: string; price: number; stock: number };

export default function BuyBox({
  product,
  variants,
  freeShipping,
}: {
  product: { id: number; slug: string; title: string; image: string; compare_at: number | null; batch: string };
  variants: V[];
  freeShipping: number;
}) {
  const formats = useMemo(() => [...new Set(variants.map((v) => v.format).filter(Boolean))], [variants]);
  const rulings = useMemo(() => [...new Set(variants.map((v) => v.ruling).filter(Boolean))], [variants]);
  const firstInStock = variants.find((v) => v.stock > 0) ?? variants[0];
  const [format, setFormat] = useState(firstInStock?.format ?? "");
  const [ruling, setRuling] = useState(firstInStock?.ruling ?? "");
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [pin, setPin] = useState("");
  const [eta, setEta] = useState<string | null>(null);
  const add = useCart((s) => s.add);
  const router = useRouter();

  const variant = variants.find((v) => (!formats.length || v.format === format) && (!rulings.length || v.ruling === ruling)) ?? variants[0];
  const soldOut = !variant || variant.stock <= 0;
  const compare = product.compare_at && variant && product.compare_at > variant.price ? product.compare_at : null;

  useEffect(() => track("product_view", { productId: product.id }), [product.id]);

  const addToBag = (go?: boolean) => {
    if (!variant || soldOut) return;
    add(
      { variantId: variant.id, productId: product.id, slug: product.slug, title: product.title, variantTitle: variant.title, price: variant.price, image: product.image },
      Math.min(qty, variant.stock),
    );
    track("add_to_cart", { productId: product.id, value: variant.price * qty });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
    if (go) {
      useCart.getState().setOpen(false);
      router.push("/checkout");
    }
  };

  const onPin = (value: string) => {
    const next = value.replace(/\D/g, "");
    setPin(next);
    if (!/^[1-9][0-9]{5}$/.test(next)) return setEta(null);
    // Rough courier windows: metros 2–4 days, elsewhere 4–7.
    const metro = ["11", "40", "56", "60", "70", "50", "30", "38", "41"].includes(next.slice(0, 2));
    const d = (n: number) => new Date(Date.now() + n * 864e5).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
    setEta(metro ? `${d(2)} – ${d(4)}` : `${d(4)} – ${d(7)}`);
  };

  const avail = (f: string, r: string) => variants.some((v) => (!f || v.format === f) && (!r || v.ruling === r) && v.stock > 0);

  return (
    <div>
      <p className="flex items-baseline gap-3 text-[22px] tabular-nums">
        {compare && <span className="text-[17px] text-muted line-through">{formatINR(compare)}</span>}
        <span>{formatINR(variant?.price ?? 0)}</span>
        {compare && <span className="rounded-full bg-clay px-2.5 py-0.5 text-[12px] text-white">Save {formatINR(compare - (variant?.price ?? 0))}</span>}
      </p>
      <p className="mt-1 text-[12.5px] text-muted">Inclusive of all taxes</p>

      {formats.length > 1 && (
        <fieldset className="mt-7">
          <legend className="text-[13px] font-medium">
            Size <span className="font-normal text-muted">— {format === "Pocket" ? "105 × 148 mm, fits a jacket pocket" : "148 × 210 mm, the classic desk size"}</span>
          </legend>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {formats.map((f) => (
              <button
                key={f}
                onClick={() => setFormat(f)}
                className={cn(
                  "rounded-full border px-5 py-2.5 text-[14px] transition",
                  format === f ? "border-ink bg-ink text-paper" : "border-line bg-white hover:border-ink",
                  !avail(f, ruling) && "text-muted line-through",
                )}
              >
                {f}
              </button>
            ))}
          </div>
        </fieldset>
      )}
      {rulings.length > 1 && (
        <fieldset className="mt-5">
          <legend className="text-[13px] font-medium">Pages</legend>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {rulings.map((r) => (
              <button
                key={r}
                onClick={() => setRuling(r)}
                className={cn(
                  "rounded-full border px-5 py-2.5 text-[14px] transition",
                  ruling === r ? "border-ink bg-ink text-paper" : "border-line bg-white hover:border-ink",
                  !avail(format, r) && "text-muted line-through",
                )}
              >
                {r}
              </button>
            ))}
          </div>
        </fieldset>
      )}

      <div className="mt-6 text-[13px]">
        {soldOut ? (
          <span className="text-bad">Sold out in this option — try another, or join the list below for the next batch.</span>
        ) : variant.stock <= 5 ? (
          <span className="text-warn">
            Only {variant.stock} left{product.batch ? ` in ${product.batch.toLowerCase()}` : ""}.
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-ok">
            <span className="h-2 w-2 rounded-full bg-ok" /> In stock, ready to ship
          </span>
        )}
      </div>

      <div className="mt-4 flex gap-3">
        <QtyStepper qty={qty} onChange={(q) => setQty(Math.max(1, Math.min(10, q)))} />
        <button onClick={() => addToBag()} disabled={soldOut} className="btn btn-primary flex-1">
          {added ? (
            <>
              <Check size={16} /> Added to bag
            </>
          ) : soldOut ? (
            "Sold out"
          ) : (
            `Add to bag · ${formatINR((variant?.price ?? 0) * qty)}`
          )}
        </button>
      </div>
      {!soldOut && (
        <button onClick={() => addToBag(true)} className="btn btn-ghost mt-3 w-full">
          Buy it now
        </button>
      )}

      <ul className="mt-7 space-y-3 rounded-2xl bg-linen/70 p-5 text-[13.5px]">
        <li className="flex gap-3">
          <Truck size={18} strokeWidth={1.5} className="shrink-0" />
          <div className="flex-1">
            <span>Free shipping over {formatINR(freeShipping)}. Dispatched within 24 hours.</span>
            <div className="mt-2 flex items-center gap-2">
              <input
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(e) => onPin(e.target.value)}
                placeholder="Enter PIN code"
                className="w-32 rounded-full border border-line bg-white px-3 py-1.5 text-[13px] outline-none focus:border-ink"
                aria-label="PIN code for delivery estimate"
              />
              {eta && <span className="text-[12.5px]">Estimated arrival: <strong className="font-medium">{eta}</strong></span>}
            </div>
          </div>
        </li>
        <li className="flex gap-3">
          <Banknote size={18} strokeWidth={1.5} className="shrink-0" />
          Cash on delivery, UPI and all cards
        </li>
        <li className="flex gap-3">
          <RotateCcw size={18} strokeWidth={1.5} className="shrink-0" />
          7-day returns on unused items. Covers can be exchanged for another cloth.
        </li>
      </ul>

      {/* mobile sticky bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 flex items-center gap-3 border-t border-line bg-paper/95 px-4 py-3 backdrop-blur md:hidden">
        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-medium">{product.title}</p>
          <p className="text-[12.5px] text-muted">
            {variant?.title} · {formatINR(variant?.price ?? 0)}
          </p>
        </div>
        <button onClick={() => addToBag()} disabled={soldOut} className="btn btn-primary px-5 py-2.5">
          {added ? "Added" : soldOut ? "Sold out" : "Add to bag"}
        </button>
      </div>
    </div>
  );
}
