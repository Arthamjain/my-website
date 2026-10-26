"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useKaya } from "@/store/useKaya";
import { fabricById } from "@/data/fabrics";
import { SILK } from "@/lib/utils";

/** Tactile digital certificate for the currently selected cover. */
export default function PassportModal() {
  const open = useKaya((s) => s.passportOpen);
  const f = useKaya((s) => fabricById[s.activeFabric]);
  const { setPassportOpen } = useKaya.getState();

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setPassportOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, setPassportOpen]);

  const rows: [string, string][] = [
    ["Weave", f.name],
    ["Master cluster", `${f.cluster} — ${f.region}`],
    ["Partner NGO", f.ngo],
    ["Loom record", f.loomLabel],
    ["Coordinates", f.coordinates],
    ["Batch", `#${f.batch.number} — ${f.batch.remaining} of ${f.batch.total} yards remaining`],
    ["Certification", "100% Handloom Mark verified"],
  ];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[75] grid place-items-center p-4">
          <motion.div
            className="absolute inset-0 bg-ink/30 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPassportOpen(false)}
          />
          <motion.article
            role="dialog"
            aria-label="Artisan provenance passport"
            initial={{ opacity: 0, rotateX: 18, y: 40 }}
            animate={{ opacity: 1, rotateX: 0, y: 0 }}
            exit={{ opacity: 0, y: 30 }}
            transition={{ duration: 0.9, ease: SILK }}
            style={{ transformPerspective: 1200 }}
            className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto border hairline bg-linen"
            data-lenis-prevent
          >
            <div className="h-2 w-full" style={{ background: `linear-gradient(90deg, ${f.color}, ${f.colorSecondary})` }} />
            <div className="p-6 md:p-10">
              <div className="flex items-start justify-between">
                <div>
                  <p className="meta text-muted">Artisan Provenance Passport · No. {f.index}</p>
                  <p className="display-sm mt-2">
                    {f.persona.split(" ").slice(0, -1).join(" ")} <em className="italic">{f.persona.split(" ").at(-1)}</em>
                  </p>
                </div>
                <button onClick={() => setPassportOpen(false)} aria-label="Close passport" className="grid h-9 w-9 place-items-center border border-ink/15 hover:border-ink">
                  <X size={15} strokeWidth={1.25} />
                </button>
              </div>
              <dl className="mt-8 divide-y divide-ink/10 border-y border-ink/10">
                {rows.map(([k, v]) => (
                  <div key={k} className="grid grid-cols-[130px_1fr] gap-4 py-3">
                    <dt className="meta pt-0.5 text-[9px] text-muted">{k}</dt>
                    <dd className="text-[14px]">{v}</dd>
                  </div>
                ))}
              </dl>
              <p className="meta mt-8 text-brass">Care ritual</p>
              <ol className="mt-3 space-y-2">
                {f.care.map((c, i) => (
                  <li key={c} className="flex gap-3 text-[14px] text-muted">
                    <span className="meta pt-0.5 text-ink">0{i + 1}</span>
                    {c}
                  </li>
                ))}
              </ol>
              <div className="mt-8 flex items-center justify-between border-t border-dashed border-brass/60 pt-4">
                <span className="font-serif text-xl italic">KĀYA · काया</span>
                <span className="meta text-[9px] text-muted">{f.coordinates}</span>
              </div>
            </div>
          </motion.article>
        </div>
      )}
    </AnimatePresence>
  );
}
