"use client";

import { useEffect, useRef, useState } from "react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useKaya } from "@/store/useKaya";
import { fabricById, rulings } from "@/data/fabrics";
import { rig } from "@/lib/rig";
import { scrollToTarget } from "@/components/ui/SmoothScroll";
import { cn } from "@/lib/utils";

const stages = [
  { n: "00", title: "Assembled", body: "One brass-spined journal, dressed in heritage cloth.", at: 0 },
  { n: "01", title: "Brass rod lifts 40%", body: "The solid spine rod glides upward, releasing the sleeve.", at: 0.27 },
  { n: "02", title: "Sleeve slides off", body: "The tailored cover slips free of its recycled buckram core.", at: 0.52 },
  { n: "03", title: "Opens wide — 160°", body: "Lay-flat Smyth-sewn binding. Flip the leaves, change the paper.", at: 0.92 },
];

const stageOf = (p: number) => (p < 0.08 ? 0 : p < 0.32 ? 1 : p < 0.58 ? 2 : 3);

export default function Anatomy() {
  const ref = useRef<HTMLElement>(null);
  const [stage, setStage] = useState(0);
  const ruling = useKaya((s) => s.ruling);
  const setRuling = useKaya((s) => s.setRuling);
  const flipPage = useKaya((s) => s.flipPage);
  const flipped = useKaya((s) => s.flippedPages);
  const f = useKaya((s) => fabricById[s.activeFabric]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let last = -1;
    const st = ScrollTrigger.create({
      trigger: el,
      start: "top top",
      end: "bottom bottom",
      onUpdate: (self) => {
        rig.explode = self.progress;
        const s = stageOf(self.progress);
        if (s !== last) {
          last = s;
          setStage(s);
        }
      },
    });
    return () => st.kill();
  }, []);

  const goTo = (p: number) => {
    const el = ref.current;
    if (!el) return;
    const top = el.getBoundingClientRect().top + window.scrollY;
    scrollToTarget(top + p * (el.offsetHeight - window.innerHeight) + 2);
  };

  return (
    <section ref={ref} id="anatomy" data-section="anatomy" className="relative h-[340vh] border-b hairline">
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        <div className="mx-auto flex h-full max-w-[1440px] flex-col justify-between px-4 pb-24 pt-20 md:px-8 md:pb-28 md:pt-24">
          <div className="flex items-start justify-between gap-8">
            <div className="max-w-sm max-md:hidden">
              <p className="meta text-muted">03 // The 30-Second Interchangeable Anatomy</p>
              <h2 className="display-sm mt-4">
                Lift. Slide. <em className="italic">Lock.</em>
                <br />A new mood in thirty seconds.
              </h2>
            </div>
            <ol className="hidden w-72 border-t hairline bg-paper/75 backdrop-blur-md lg:block">
              {stages.map((s, i) => (
                <li key={s.n} className="border-b hairline">
                  <button onClick={() => goTo(s.at)} className="flex w-full gap-4 py-3 text-left">
                    <span className={cn("meta pt-1 transition-colors", stage === i ? "text-brass" : "text-muted/60")}>{s.n}</span>
                    <span>
                      <span className={cn("block font-serif text-lg transition-colors", stage === i ? "text-ink" : "text-muted/70")}>{s.title}</span>
                      <span
                        className={cn(
                          "grid text-[12px] leading-snug text-muted transition-[grid-template-rows,opacity] duration-700",
                          stage === i ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                        )}
                      >
                        <span className="overflow-hidden">{s.body}</span>
                      </span>
                    </span>
                  </button>
                </li>
              ))}
            </ol>
          </div>

          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="glass max-w-md rounded-[2px] p-4 md:bg-transparent md:p-0 md:backdrop-blur-none md:[border:0]">
              <p className="meta text-brass md:hidden">
                {stages[stage].n} {"//"} {stages[stage].title}
              </p>
              <div className="mt-2 flex gap-1 md:mt-0">
                {stages.map((s, i) => (
                  <button
                    key={s.n}
                    onClick={() => goTo(s.at)}
                    aria-label={s.title}
                    className={cn("h-8 flex-1 border px-3 meta text-[9px] transition-colors md:flex-none", stage === i ? "border-ink bg-ink text-paper" : "border-ink/15 text-muted hover:border-ink")}
                  >
                    {s.n}
                  </button>
                ))}
              </div>
              <p className="meta mt-4 text-[9px] text-muted">Woven tag inside: crafted with {f.ngo}</p>
            </div>

            <div
              className={cn(
                "glass rounded-[2px] p-4 transition-[opacity,transform] duration-700",
                stage === 3 ? "translate-y-0 opacity-100" : "pointer-events-none translate-y-4 opacity-0",
              )}
            >
              <p className="meta text-[9px] text-muted">Paper architecture — live on the pages</p>
              <div className="mt-3 flex flex-wrap gap-1">
                {rulings.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRuling(r.id)}
                    className={cn("meta h-8 border px-3 text-[9px] transition-colors", ruling === r.id ? "border-ink bg-ink text-paper" : "border-ink/15 hover:border-ink")}
                  >
                    {r.label}
                  </button>
                ))}
                <button onClick={flipPage} className="meta h-8 border border-brass px-3 text-[9px] text-brass transition-colors hover:bg-brass hover:text-paper">
                  {flipped === 3 ? "Restack leaves" : `Flip leaf ${flipped + 1}/3`}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
