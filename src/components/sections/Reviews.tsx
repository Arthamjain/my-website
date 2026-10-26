"use client";

import { useKaya } from "@/store/useKaya";
import { fabricById, fabrics, type FabricId } from "@/data/fabrics";
import Accordion from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Atmosphere";
import { scrollToTarget } from "@/components/ui/SmoothScroll";

const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const stories: { role: string; city: string; name: string; quote: string; week: FabricId[] }[] = [
  {
    role: "Architect",
    city: "Mumbai",
    name: "Ira M.",
    quote:
      "Indigo for drawing-set days, Zari when I'm presenting to a client. Swapping the sleeve has become my way of walking into a different version of the studio.",
    week: ["dabu", "dabu", "chanderi", "dabu", "chanderi", "tussar", "tussar"],
  },
  {
    role: "Film Director",
    city: "Delhi",
    name: "Kabir S.",
    quote:
      "Mashru on writing days, when I need the page to feel loud. Jamdani for the edit — slower, softer, more honest notes. The brass rod click is my clapperboard.",
    week: ["mashru", "mashru", "jamdani", "mashru", "jamdani", "jamdani", "tussar"],
  },
  {
    role: "Behavioural Psychologist",
    city: "Bengaluru",
    name: "Dr. Anaya R.",
    quote:
      "I recommend low-arousal colours for deep work and use them myself. Tussar on Sundays is a sensory detox — no dye, nothing to decode, just thinking.",
    week: ["dabu", "tussar", "dabu", "jamdani", "dabu", "mashru", "tussar"],
  },
];

export default function Reviews() {
  const setFabric = useKaya((s) => s.setFabric);
  return (
    <section id="reviews" data-section="reviews" className="relative z-[2] bg-linen">
      <div className="mx-auto max-w-[1440px] px-4 py-28 md:px-8 md:py-36">
        <Reveal>
          <p className="meta text-muted">06 // Field Notes</p>
          <h2 className="display mt-5 max-w-3xl">
            How they <em className="italic">wear</em> their covers.
          </h2>
        </Reveal>

        <div className="mt-16 grid border-l border-t hairline md:grid-cols-3">
          {stories.map((s, i) => (
            <Reveal key={s.name} delay={i * 0.1} className="flex flex-col border-b border-r hairline bg-paper/50 p-6 md:p-8">
              <p className="meta text-brass">
                {s.role} — {s.city}
              </p>
              <p className="mt-5 flex-1 font-serif text-2xl leading-snug">“{s.quote}”</p>
              <p className="meta mt-6 text-[10px] text-muted">{s.name}</p>
              <div className="mt-6 grid grid-cols-7 gap-px border-t hairline pt-4">
                {s.week.map((id, d) => (
                  <button
                    key={d}
                    onClick={() => setFabric(id)}
                    className="group flex flex-col items-center gap-2"
                    aria-label={`${days[d]}: ${fabricById[id].shortName}`}
                  >
                    <span className="h-10 w-full transition-transform duration-500 group-hover:-translate-y-1" style={{ background: fabricById[id].color }} />
                    <span className="meta text-[8px] text-muted">{days[d]}</span>
                  </button>
                ))}
              </div>
            </Reveal>
          ))}
        </div>

        <div className="mt-28 grid grid-cols-12 gap-y-10">
          <Reveal className="col-span-12 md:col-span-4">
            <p className="meta text-muted">Care rituals</p>
            <h3 className="display-sm mt-4">
              Cloth that <em className="italic">ages</em> with you.
            </h3>
            <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-muted">
              Handloom is alive. A little care and each cover softens, mellows and records the life you lived with it.
            </p>
          </Reveal>
          <div className="col-span-12 md:col-span-7 md:col-start-6">
            <Accordion
              items={fabrics.map((f) => ({
                id: f.id,
                meta: f.index,
                title: f.name,
                content: (
                  <ul className="space-y-1.5">
                    {f.care.map((c) => (
                      <li key={c}>— {c}</li>
                    ))}
                  </ul>
                ),
              }))}
            />
          </div>
        </div>
      </div>

      <footer className="border-t hairline">
        <div className="mx-auto grid max-w-[1440px] grid-cols-12 gap-y-8 px-4 pb-36 pt-16 md:px-8">
          <div className="col-span-12 md:col-span-5">
            <p className="font-serif text-6xl tracking-[0.06em]">KĀYA</p>
            <p className="mt-1 font-serif text-2xl italic text-muted">काया — the body, the vessel.</p>
          </div>
          <div className="col-span-6 md:col-span-3">
            <p className="meta text-muted">Explore</p>
            <ul className="mt-3 space-y-2 text-[14px]">
              {[
                ["diagnosis", "Chromatic Diagnosis"],
                ["anatomy", "Anatomy"],
                ["ledger", "Provenance Ledger"],
                ["atelier", "Atelier"],
              ].map(([id, label]) => (
                <li key={id}>
                  <button onClick={() => scrollToTarget(id)} className="hover:text-brass">
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div className="col-span-6 md:col-span-4">
            <p className="meta text-muted">Woven with</p>
            <ul className="mt-3 space-y-2 text-[14px]">
              {fabrics.map((f) => (
                <li key={f.id} className="flex items-center gap-2">
                  <span className="h-2 w-2" style={{ background: f.color }} />
                  {f.ngo}
                </li>
              ))}
            </ul>
          </div>
          <p className="meta col-span-12 border-t hairline pt-6 text-[9px] text-muted">© 2026 KĀYA Atelier · Handloom Mark · Made in India</p>
        </div>
      </footer>
    </section>
  );
}
