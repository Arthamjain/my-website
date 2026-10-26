"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useShallow } from "zustand/react/shallow";
import { useKaya } from "@/store/useKaya";
import { fabricById, fabrics, formats, rulings, tiers, type FabricId } from "@/data/fabrics";
import Swatch from "@/components/ui/Swatch";
import CurtainButton from "@/components/ui/CurtainButton";
import Accordion from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Atmosphere";
import { impactSentence } from "@/lib/impact";
import { formatINR, SILK, cn } from "@/lib/utils";

const MONOGRAM_FEE = 350;
const slotNames = ["Focus", "Spark", "Rest"];

function StepHeader({ n, title, aside }: { n: string; title: string; aside?: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b hairline pb-3">
      <p className="flex items-baseline gap-3">
        <span className="meta text-brass">Step {n}</span>
        <span className="font-serif text-2xl">{title}</span>
      </p>
      {aside}
    </div>
  );
}

export default function Atelier() {
  const s = {
    ...useKaya.getState(),
    ...useKaya(
      useShallow((st) => ({
        activeFabric: st.activeFabric,
        tier: st.tier,
        wardrobe: st.wardrobe,
        format: st.format,
        ruling: st.ruling,
        monogram: st.monogram,
        isOpen: st.isOpen,
      })),
    ),
  };
  const [slot, setSlot] = useState(0);
  const f = fabricById[s.activeFabric];

  const pickFabric = (id: FabricId) => {
    if (s.tier === 2) s.setWardrobeSlot(slot, id);
    s.setFabric(id);
  };

  const selectSlot = (i: number) => {
    setSlot(i);
    s.setFabric(s.wardrobe[i]);
  };

  const ids: FabricId[] = s.tier === 1 ? [f.id] : s.tier === 2 ? s.wardrobe : fabrics.map((x) => x.id);
  const monogramFee = s.tier === 1 && s.monogram ? MONOGRAM_FEE : 0;
  const price = (s.tier === 1 ? f.priceComplete : (tiers[s.tier - 1].price as number)) + monogramFee;

  const add = () => {
    const t = tiers[s.tier - 1];
    s.addItem({
      kind: "ritual",
      tier: s.tier,
      title: s.tier === 1 ? `${t.name} — ${f.shortName}` : t.name,
      subtitle: s.tier === 1 ? t.detail : ids.map((id) => fabricById[id].shortName).join(" · ") + (s.tier === 3 ? " + Teakwood cradle" : ""),
      fabricIds: ids,
      format: s.format,
      ruling: s.ruling,
      monogram: s.monogram || undefined,
      unitPrice: price,
    });
    s.setCartOpen(true);
  };

  return (
    <section id="atelier" data-section="atelier" className="relative border-b hairline">
      <div className="mx-auto grid max-w-[1440px] grid-cols-12 px-4 pb-24 pt-[42svh] md:px-8 md:py-36">
        <div className="col-span-12 md:col-span-7 md:col-start-6 lg:col-span-6 lg:col-start-7">
          <Reveal className="max-md:glass max-md:p-5">
            <p className="meta text-muted">05 // The Bespoke Atelier</p>
            <h2 className="display mt-5">
              Compose your <em className="italic">ritual.</em>
            </h2>
            <p className="mt-5 max-w-lg text-[15px] leading-relaxed text-muted">
              Every choice renders live on the journal beside you — the cover, the paper, your initials in brass foil.
            </p>
          </Reveal>

          <div className="glass mt-12 rounded-[2px] p-5 md:p-8">
            {/* Step 1 — tier */}
            <StepHeader n="01" title="Choose your ritual tier" />
            <div className="mt-4 space-y-2">
              {tiers.map((t) => {
                const on = s.tier === t.id;
                const tPrice = t.id === 1 ? f.priceComplete : (t.price as number);
                return (
                  <button
                    key={t.id}
                    onClick={() => s.setTier(t.id)}
                    aria-pressed={on}
                    className={cn(
                      "relative block w-full rounded-[2px] border p-4 text-left transition-colors duration-500",
                      on ? "border-ink bg-paper" : "border-ink/10 hover:border-ink/40",
                    )}
                  >
                    {t.badge && <span className="meta absolute -top-2.5 right-4 bg-brass px-2 text-[9px] text-paper">{t.badge}</span>}
                    <div className="flex items-baseline justify-between gap-4">
                      <p className="flex items-baseline gap-3">
                        <span className="font-serif text-lg italic text-muted">{t.numeral}</span>
                        <span className="font-serif text-xl">{t.name}</span>
                      </p>
                      <p className="flex items-baseline gap-2">
                        {t.id === 2 && <s className="text-[12px] text-muted">{formatINR(Math.round(3850 / 0.78))}</s>}
                        <span className="font-serif text-xl">{formatINR(tPrice)}</span>
                      </p>
                    </div>
                    <p className="mt-1 pl-7 text-[12px] leading-snug text-muted">{t.detail}</p>
                  </button>
                );
              })}
            </div>

            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={s.tier}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.6, ease: SILK }}
                className="overflow-hidden"
              >
                <div className="pt-5">
                  {s.tier === 2 && (
                    <div className="mb-4 grid grid-cols-3 gap-2">
                      {s.wardrobe.map((id, i) => (
                        <button
                          key={i}
                          onClick={() => selectSlot(i)}
                          className={cn("flex items-center gap-2 border p-2 text-left transition-colors", slot === i ? "border-ink" : "border-ink/10 hover:border-ink/40")}
                        >
                          <span className="h-8 w-6 shrink-0" style={{ background: fabricById[id].color }} />
                          <span>
                            <span className="meta block text-[8px] text-muted">Slot {i + 1} · {slotNames[i]}</span>
                            <span className="block text-[12px] leading-tight">{fabricById[id].shortName}</span>
                          </span>
                        </button>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="meta mr-2 text-[9px] text-muted">
                      {s.tier === 2 ? `Dress slot ${slot + 1}` : s.tier === 3 ? "Preview the archive" : "Your cover"}
                    </span>
                    {fabrics.map((x) => (
                      <Swatch key={x.id} id={x.id} active={x.id === s.activeFabric} onSelect={pickFabric} />
                    ))}
                  </div>
                  {s.tier === 3 && <p className="meta mt-3 text-[9px] text-muted">+ Handcrafted teakwood desk cradle, oiled by hand in Channapatna</p>}
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Step 2 — format & paper */}
            <div className="mt-10">
              <StepHeader n="02" title="Format & paper architecture" />
              <div className="mt-4 grid grid-cols-2 gap-2">
                {formats.map((x) => (
                  <button
                    key={x.id}
                    onClick={() => s.setFormat(x.id)}
                    className={cn("border p-3 text-left transition-colors", s.format === x.id ? "border-ink" : "border-ink/10 hover:border-ink/40")}
                  >
                    <span className="block font-serif text-lg">{x.label}</span>
                    <span className="meta text-[9px] text-muted">{x.dims}</span>
                  </button>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-3 gap-2">
                {rulings.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      s.setRuling(r.id);
                      if (!s.isOpen) s.setOpen(true);
                    }}
                    className={cn("meta h-10 border px-2 text-[9px] transition-colors", s.ruling === r.id ? "border-ink bg-ink text-paper" : "border-ink/10 hover:border-ink/40")}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3 — monogram */}
            <div className="mt-10">
              <StepHeader
                n="03"
                title="Brass foil monogram"
                aside={<span className="meta text-[9px] text-muted">{s.tier === 1 ? `+ ${formatINR(MONOGRAM_FEE)}` : "Complimentary"}</span>}
              />
              <div className="mt-4 flex items-end gap-4">
                <label className="flex-1">
                  <span className="meta text-[9px] text-muted">Up to 3 initials — stamps live on the cover</span>
                  <input
                    value={s.monogram}
                    onChange={(e) => {
                      s.setMonogram(e.target.value);
                      if (s.isOpen) s.setOpen(false);
                    }}
                    maxLength={3}
                    placeholder="A·J·K"
                    className="field font-serif text-3xl tracking-[0.3em] uppercase"
                    aria-label="Monogram initials"
                  />
                </label>
                <div className="grid h-16 w-24 place-items-center border hairline" style={{ background: f.color }}>
                  <span className="font-serif text-2xl italic text-gold">{s.monogram ? s.monogram.split("").join("·") : "—"}</span>
                </div>
              </div>
            </div>

            {/* Step 4 — acquisition */}
            <div className="mt-10 border-t hairline pt-6">
              <div className="flex items-baseline justify-between">
                <p className="meta text-muted">Step 04 · Your ritual</p>
                <p className="font-serif text-4xl">{formatINR(price)}</p>
              </div>
              <p className="mt-3 text-[13px] leading-snug text-ink">{impactSentence(ids)}</p>
              <p className="meta mt-2 text-[9px] text-muted">
                Batch #{f.batch.number} — {f.cluster} {"//"} {f.batch.remaining} of {f.batch.total} yards remaining this monsoon cycle
              </p>
              <CurtainButton label="Add Ritual to Bag" full className="mt-6 h-14" onClick={add} />
            </div>
          </div>

          <Accordion
            className="mt-10 max-md:glass max-md:px-5"
            items={[
              {
                id: "paper",
                meta: "S1",
                title: "Paper & binding",
                content: "120GSM acid-free cotton rag, 192 pages, deckled fore-edge. Smyth-sewn in 12 signatures for a true lay-flat spread. Fountain-pen tested.",
              },
              {
                id: "spine",
                meta: "S2",
                title: "The brass spine system",
                content: "Solid 6mm brass rod with turned finials, hand-rubbed to an antique patina. Refill blocks drop in; the rod locks the sleeve with a soft click.",
              },
              {
                id: "sleeve",
                meta: "S3",
                title: "Sleeve construction",
                content: "Handloom face fabric bonded to an unbleached khadi lining, with interior pockets that grip a recycled buckram core. Lotus-leaf wax spill-shield.",
              },
              {
                id: "ship",
                meta: "S4",
                title: "Delivery & returns",
                content: "Complimentary insured shipping across India in 4–6 days. 30-day returns on unused covers; monogrammed pieces are final sale.",
              },
            ]}
          />
        </div>
      </div>
    </section>
  );
}
