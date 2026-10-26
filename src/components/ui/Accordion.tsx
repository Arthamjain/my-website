"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { SILK, cn } from "@/lib/utils";

export interface AccordionItem {
  id: string;
  title: string;
  meta?: string;
  content: React.ReactNode;
}

/** Editorial accordion for progressive disclosure of deep specifications. */
export default function Accordion({ items, className }: { items: AccordionItem[]; className?: string }) {
  const [open, setOpen] = useState<string | null>(null);
  return (
    <div className={cn("border-t hairline", className)}>
      {items.map((item) => {
        const isOpen = open === item.id;
        return (
          <div key={item.id} className="border-b hairline">
            <button
              onClick={() => setOpen(isOpen ? null : item.id)}
              className="flex w-full items-center justify-between gap-4 py-4 text-left"
              aria-expanded={isOpen}
            >
              <span className="flex items-baseline gap-4">
                {item.meta && <span className="meta text-muted">{item.meta}</span>}
                <span className="font-serif text-xl">{item.title}</span>
              </span>
              <Plus size={16} strokeWidth={1.25} className={cn("shrink-0 transition-transform duration-700 ease-silk", isOpen && "rotate-45")} />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.7, ease: SILK }}
                  className="overflow-hidden"
                >
                  <div className="pb-5 text-[14px] leading-relaxed text-muted">{item.content}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
