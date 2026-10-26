"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, X } from "lucide-react";
import { useKaya, cartTotal } from "@/store/useKaya";
import { fabricById, fabrics, formats, rulings } from "@/data/fabrics";
import { computeImpact } from "@/lib/impact";
import { formatINR, SILK, cn } from "@/lib/utils";
import CurtainButton from "./CurtainButton";
import { scrollToTarget } from "./SmoothScroll";

const PALETTE_PRICE = 750;

export default function BagDrawer() {
  const open = useKaya((s) => s.cartOpen);
  const cart = useKaya((s) => s.cart);
  const activeFabric = useKaya((s) => s.activeFabric);
  const { setCartOpen, removeItem, setQty, addItem, setCheckoutOpen } = useKaya.getState();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setCartOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setCartOpen]);

  const total = cartTotal(cart);
  const impact = computeImpact(cart);
  const inCart = new Set(cart.flatMap((i) => i.fabricIds));

  // Balance-your-nervous-system pairing: anchor on the first cover in the bag.
  const anchorId = cart.find((i) => i.tag === undefined)?.fabricIds[0] ?? activeFabric;
  const anchor = fabricById[anchorId];
  const complement = fabricById[anchor.complement];
  const pairing = cart.find((i) => i.tag === "pairing");
  const pairPrice = Math.round(complement.priceSleeve * 0.75);

  const togglePairing = () => {
    if (pairing) removeItem(pairing.key);
    else
      addItem({
        kind: "sleeve",
        title: `${complement.shortName} Sleeve`,
        subtitle: "Balance pairing — 25% bundle privilege",
        fabricIds: [complement.id],
        unitPrice: pairPrice,
        tag: "pairing",
      });
  };

  const paletteItem = cart.find((i) => i.tag === "palette");
  const paletteCandidate = fabrics.find((f) => !inCart.has(f.id) && f.id !== complement.id);
  const addPalette = () => {
    if (!paletteCandidate) return;
    addItem({
      kind: "sleeve",
      title: `${paletteCandidate.shortName} Sleeve`,
      subtitle: "Complete your emotional palette",
      fabricIds: [paletteCandidate.id],
      unitPrice: PALETTE_PRICE,
      tag: "palette",
    });
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[70]">
          <motion.div
            className="absolute inset-0 bg-ink/25 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: SILK }}
            onClick={() => setCartOpen(false)}
          />
          <motion.aside
            role="dialog"
            aria-label="Ritual bag"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.85, ease: SILK }}
            className="absolute right-0 top-0 flex h-full w-full max-w-[460px] flex-col border-l hairline bg-paper"
          >
            <div className="flex items-center justify-between border-b hairline px-6 py-5">
              <div>
                <p className="meta text-muted">Your Ritual Bag</p>
                <p className="font-serif text-2xl">{cart.length ? `${cart.length} piece${cart.length > 1 ? "s" : ""}` : "Awaiting a mood"}</p>
              </div>
              <button onClick={() => setCartOpen(false)} aria-label="Close bag" className="grid h-10 w-10 place-items-center border hairline hover:border-ink">
                <X size={16} strokeWidth={1.25} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6" data-lenis-prevent>
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-start justify-center gap-6">
                  <p className="display-sm">
                    An empty page is <em className="italic">a beginning.</em>
                  </p>
                  <CurtainButton
                    label="Visit the Atelier"
                    onClick={() => {
                      setCartOpen(false);
                      scrollToTarget("atelier");
                    }}
                  />
                </div>
              ) : (
                <>
                  <ul>
                    {cart.map((item) => (
                      <li key={item.key} className="flex gap-4 border-b hairline py-5">
                        <div className="flex h-20 w-14 shrink-0 flex-col gap-[2px] border hairline p-[3px]">
                          {item.fabricIds.map((id) => (
                            <span
                              key={id}
                              className="block flex-1"
                              style={{ background: fabricById[id].color }}
                            />
                          ))}
                        </div>
                        <div className="flex flex-1 flex-col gap-1">
                          <div className="flex items-start justify-between gap-3">
                            <p className="font-serif text-lg leading-tight">{item.title}</p>
                            <p className="font-serif text-lg">{formatINR(item.unitPrice * item.qty)}</p>
                          </div>
                          <p className="text-[12px] text-muted">{item.subtitle}</p>
                          <div className="meta flex flex-wrap gap-x-3 text-[9px] text-muted">
                            {item.format && <span>{formats.find((x) => x.id === item.format)?.label}</span>}
                            {item.ruling && <span>{rulings.find((x) => x.id === item.ruling)?.label}</span>}
                            {item.monogram && (
                              <span className="border border-brass/50 px-1.5 text-brass">Monogram · {item.monogram.split("").join("·")}</span>
                            )}
                          </div>
                          <div className="mt-2 flex items-center justify-between">
                            <div className="flex items-center border hairline">
                              <button onClick={() => setQty(item.key, item.qty - 1)} className="grid h-7 w-7 place-items-center" aria-label="Decrease">
                                <Minus size={12} strokeWidth={1.25} />
                              </button>
                              <span className="meta w-6 text-center">{item.qty}</span>
                              <button onClick={() => setQty(item.key, item.qty + 1)} className="grid h-7 w-7 place-items-center" aria-label="Increase">
                                <Plus size={12} strokeWidth={1.25} />
                              </button>
                            </div>
                            <button onClick={() => removeItem(item.key)} className="meta text-[9px] text-muted underline-offset-4 hover:text-ink hover:underline">
                              Remove
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>

                  {/* Balance your nervous system */}
                  <div className="mt-6 border hairline bg-linen/60 p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="meta text-brass">Balance your nervous system</p>
                        <p className="mt-1 font-serif text-lg leading-snug">
                          Pair {anchor.shortName} with <em className="italic">{complement.shortName}</em>
                        </p>
                        <p className="mt-1 text-[12px] leading-snug text-muted">
                          {anchor.emotion.split(",")[0]} meets {complement.emotion.split(",")[0].toLowerCase()}. Sleeve at a 25% bundle privilege:{" "}
                          <s>{formatINR(complement.priceSleeve)}</s> {formatINR(pairPrice)}.
                        </p>
                      </div>
                      <button
                        role="switch"
                        aria-checked={!!pairing}
                        onClick={togglePairing}
                        className={cn(
                          "relative mt-1 h-6 w-11 shrink-0 rounded-full border transition-colors duration-500",
                          pairing ? "border-ink bg-ink" : "border-ink/25 bg-paper",
                        )}
                      >
                        <motion.span
                          layout
                          transition={{ type: "spring", stiffness: 280, damping: 26, mass: 0.9 }}
                          className={cn("absolute top-[3px] h-4 w-4 rounded-full", pairing ? "right-[3px] bg-brass" : "left-[3px] bg-ink/60")}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Complete your emotional palette */}
                  {paletteCandidate && !paletteItem && (
                    <button
                      onClick={addPalette}
                      className="mt-3 flex w-full items-center justify-between border hairline px-4 py-3 text-left transition-colors hover:border-ink"
                    >
                      <span className="flex items-center gap-3">
                        <span className="h-6 w-6" style={{ background: paletteCandidate.color }} />
                        <span>
                          <span className="meta block text-[9px] text-muted">Complete your emotional palette</span>
                          <span className="font-serif text-lg">{paletteCandidate.persona} sleeve</span>
                        </span>
                      </span>
                      <span className="meta text-ink">+ {formatINR(PALETTE_PRICE)}</span>
                    </button>
                  )}

                  {/* Artisan impact allocation */}
                  <div className="mt-6 pb-6">
                    <div className="meta flex justify-between text-muted">
                      <span>Artisan Impact Allocation</span>
                      <span className="text-ink">{formatINR(impact.amount)}</span>
                    </div>
                    <div className="mt-2 flex h-1.5 w-full overflow-hidden bg-ink/[0.06]">
                      {impact.lines.map((l) => (
                        <motion.span
                          key={l.ngo}
                          layout
                          className="h-full"
                          style={{ background: l.color, width: `${(l.amount / Math.max(total, 1)) * 100}%` }}
                        />
                      ))}
                    </div>
                    <ul className="mt-3 space-y-1">
                      {impact.lines.map((l) => (
                        <li key={l.ngo} className="flex justify-between text-[12px] text-muted">
                          <span>
                            {l.ngo} · {l.hours} loom hrs
                          </span>
                          <span className="text-ink">{formatINR(l.amount)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t hairline px-6 py-5">
                <div className="flex items-baseline justify-between">
                  <span className="meta text-muted">Subtotal · Shipping complimentary</span>
                  <span className="font-serif text-3xl">{formatINR(total)}</span>
                </div>
                <CurtainButton label="Proceed to Checkout" full className="mt-4" onClick={() => setCheckoutOpen(true)} />
              </div>
            )}
          </motion.aside>
        </div>
      )}
    </AnimatePresence>
  );
}
