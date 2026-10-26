"use client";

import { useEffect, useRef } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useKaya } from "@/store/useKaya";
import { fabricById, fabrics } from "@/data/fabrics";
import Accordion from "@/components/ui/Accordion";
import CurtainButton from "@/components/ui/CurtainButton";
import { Reveal } from "@/components/ui/Atmosphere";
import { scrollToTarget } from "@/components/ui/SmoothScroll";
import { cn } from "@/lib/utils";

const parse = (coords: string) => {
  const [lat, lon] = coords.split(",").map((s) => parseFloat(s));
  return { lat, lon };
};

function ClusterPlot() {
  const active = useKaya((s) => s.activeFabric);
  const setFabric = useKaya((s) => s.setFabric);
  return (
    <>
    <div className="relative mt-8 h-56 border hairline bg-paper/60">
      {/* graticule */}
      {[0.25, 0.5, 0.75].map((p) => (
        <span key={`h${p}`} className="absolute left-0 h-px w-full bg-ink/[0.06]" style={{ top: `${p * 100}%` }} />
      ))}
      {[0.2, 0.4, 0.6, 0.8].map((p) => (
        <span key={`v${p}`} className="absolute top-0 h-full w-px bg-ink/[0.06]" style={{ left: `${p * 100}%` }} />
      ))}
      {fabrics.map((f) => {
        const { lat, lon } = parse(f.coordinates);
        const x = ((lon - 71.5) / 17.7) * 100;
        const y = (1 - (lat - 22.8) / 4.6) * 100;
        const on = f.id === active;
        return (
          <button
            key={f.id}
            onClick={() => setFabric(f.id)}
            className="group absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${x}%`, top: `${y}%` }}
            aria-label={`${f.ngo}, ${f.region}`}
          >
            <span className={cn("block rounded-full border transition-all duration-700", on ? "h-4 w-4 border-ink" : "h-2.5 w-2.5 border-transparent")} style={{ background: f.color }} />
            <span
              className={cn(
                "meta absolute left-1/2 top-5 -translate-x-1/2 whitespace-nowrap text-[8px] transition-colors",
                on ? "text-ink" : "text-muted/70 group-hover:text-ink",
              )}
            >
              {f.region.split(",")[0]}
            </span>
          </button>
        );
      })}
    </div>
    <div className="meta mt-2 flex justify-between text-[8px] text-muted">
      <span>71.5° E</span>
      <span>22.8°–27.4° N · partner clusters</span>
      <span>89.2° E</span>
    </div>
    </>
  );
}

export default function Ledger() {
  const ref = useRef<HTMLElement>(null);
  const stage = useKaya((s) => s.ledgerStage);
  const setLedgerStage = useKaya((s) => s.setLedgerStage);
  const setPassportOpen = useKaya((s) => s.setPassportOpen);
  const f = useKaya((s) => fabricById[s.activeFabric]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const triggers = [...el.querySelectorAll<HTMLElement>("[data-stage]")].map((node) =>
      ScrollTrigger.create({
        trigger: node,
        start: "top 60%",
        end: "bottom 60%",
        onToggle: (self) => self.isActive && setLedgerStage(Number(node.dataset.stage)),
      }),
    );
    return () => triggers.forEach((t) => t.kill());
  }, [setLedgerStage]);

  const jump = (i: number) => {
    const node = ref.current?.querySelector<HTMLElement>(`[data-stage="${i}"]`);
    if (node) scrollToTarget(node.getBoundingClientRect().top + window.scrollY - window.innerHeight * 0.2);
  };

  const blocks = [
    {
      title: (
        <>
          Indigenous soil &amp; <em className="italic">botanical</em> vats
        </>
      ),
      body: (
        <>
          <p>
            Rain-fed Kala cotton — an old-world, pesticide-free strain — is spun and dyed with what grows nearby: fermented indigo, madder
            root, pomegranate rind and iron-rust mordants. No synthetic dyes, no effluent.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-px border hairline bg-ink/[0.08]">
            {[
              ["Kala cotton", "Rain-fed · GM-free"],
              ["Indigofera", "14-day vat ferment"],
              ["Madder root", "Rubia cordifolia"],
              ["Pomegranate rind", "Tannin mordant"],
            ].map(([a, b]) => (
              <div key={a} className="bg-paper/80 p-4">
                <p className="font-serif text-lg">{a}</p>
                <p className="meta text-[9px] text-muted">{b}</p>
              </div>
            ))}
          </div>
        </>
      ),
    },
    {
      title: (
        <>
          The pit loom &amp; <em className="italic">grassroots</em> NGOs
        </>
      ),
      body: (
        <>
          <p>Every cover is woven with a partner cluster. Tap a coordinate to change the cover — and the hands behind it.</p>
          <ClusterPlot />
          <div className="mt-6 flex flex-col gap-1 border-b hairline pb-4 lg:flex-row lg:items-baseline lg:justify-between lg:gap-6">
            <p className="font-serif text-2xl">{f.ngo}</p>
            <p className="meta text-[9px] text-muted">{f.ngoNote}</p>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div>
              <p className="font-serif text-5xl">72%</p>
              <p className="meta mt-1 text-[9px] text-muted">Of cover margin returned to artisan clusters</p>
            </div>
            <div>
              <p className="font-serif text-5xl">100%</p>
              <p className="meta mt-1 text-[9px] text-muted">Handloom Mark verified</p>
            </div>
          </div>
          <Accordion
            className="mt-8"
            items={[
              {
                id: "audit",
                meta: "A1",
                title: "How the 72% is audited",
                content:
                  "Cover margin is calculated after materials and tailoring. 72% of it is paid to the weaving cluster in two tranches — on loom start and on delivery — and reconciled against loom logs each quarter.",
              },
              {
                id: "wage",
                meta: "A2",
                title: "Fair-wage loom hours",
                content: `Weavers are paid per loom hour, not per piece, so slower, more intricate work is never penalised. ${f.shortName}: ${f.loomLabel}.`,
              },
              {
                id: "partners",
                meta: "A3",
                title: "All five partner clusters",
                content: (
                  <ul className="space-y-1">
                    {fabrics.map((x) => (
                      <li key={x.id} className="flex justify-between gap-4">
                        <span>{x.ngo}</span>
                        <span className="meta text-[9px]">{x.region}</span>
                      </li>
                    ))}
                  </ul>
                ),
              },
            ]}
          />
        </>
      ),
    },
    {
      title: (
        <>
          Precision tailoring &amp; <em className="italic">spill-shield</em>
        </>
      ),
      body: (
        <>
          <p>
            Each sleeve is cut to ±0.5mm and finished with a plant-based lotus-leaf wax. Your morning chai beads up and rolls off — the weave
            still breathes.
          </p>
          <div className="relative mt-8 h-40 overflow-hidden border hairline" style={{ background: f.color }}>
            {[
              [22, 40, 26],
              [58, 30, 18],
              [74, 64, 12],
              [40, 70, 9],
            ].map(([x, y, r], i) => (
              <span
                key={i}
                className="absolute rounded-full"
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  width: r * 2,
                  height: r * 2,
                  background: "radial-gradient(circle at 35% 30%, rgba(255,250,240,0.85), rgba(176,120,70,0.55) 45%, rgba(110,70,40,0.65))",
                  boxShadow: "0 3px 6px rgba(28,25,23,0.25)",
                }}
              />
            ))}
            <span className="meta absolute bottom-3 left-3 text-[9px] text-paper/90">Contact angle &gt; 140° · Hydrophobic</span>
          </div>
        </>
      ),
    },
    {
      title: (
        <>
          Your artisan <em className="italic">provenance passport</em>
        </>
      ),
      body: (
        <>
          <p>Every cover ships with a passport tracing its cluster, loom hours, coordinates and care. Inspect the one for your current mood.</p>
          <div className="mt-6 border hairline bg-linen/70 p-5">
            <p className="meta text-[9px] text-muted">Live passport preview</p>
            <p className="mt-2 font-serif text-2xl">{f.name}</p>
            <p className="meta mt-2 text-[10px] text-muted">
              {f.loomLabel} {"//"} {f.coordinates}
            </p>
          </div>
          <CurtainButton label="Inspect Live Passport" className="mt-6" onClick={() => setPassportOpen(true)} />
        </>
      ),
    },
  ];

  return (
    <section ref={ref} id="ledger" data-section="ledger" className="relative border-b hairline">
      <div className="mx-auto grid max-w-[1440px] grid-cols-12 px-4 md:px-8">
        <div className="col-span-12 md:col-span-6 lg:col-span-5">
          <div className="pt-[40svh] md:pt-36">
            <Reveal className="max-md:glass max-md:p-5">
              <p className="meta text-muted">04 // From Soil to Spine</p>
              <h2 className="display mt-5">
                Radical <em className="italic">transparency,</em> thread by thread.
              </h2>
            </Reveal>
          </div>

          <div className="sticky top-16 z-10 mt-10 flex gap-1 bg-paper/80 py-3 backdrop-blur-md">
            {blocks.map((_, i) => (
              <button
                key={i}
                onClick={() => jump(i)}
                className={cn("meta h-8 flex-1 border text-[9px] transition-colors", stage === i ? "border-ink bg-ink text-paper" : "border-ink/15 text-muted hover:border-ink")}
              >
                0{i + 1}
              </button>
            ))}
          </div>

          {blocks.map((b, i) => (
            <div key={i} data-stage={i} className="flex min-h-[85svh] flex-col justify-center py-16">
              <div className="max-md:glass max-md:p-5">
                <p className="meta text-brass">0{i + 1} {"//"}</p>
                <h3 className="display-sm mt-3">{b.title}</h3>
                <div className="mt-5 text-[15px] leading-relaxed text-muted">{b.body}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
