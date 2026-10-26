"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Accordion({ items, defaultOpen = 0 }: { items: { title: string; content: React.ReactNode }[]; defaultOpen?: number }) {
  const [open, setOpen] = useState<number | null>(defaultOpen);
  return (
    <div className="divide-y divide-line border-y border-line">
      {items.map((it, i) => (
        <div key={it.title}>
          <button className="flex w-full items-center justify-between py-4 text-left text-[15px]" onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i}>
            {it.title}
            <Plus size={16} className={cn("transition-transform duration-300", open === i && "rotate-45")} />
          </button>
          <div className={cn("grid transition-[grid-template-rows] duration-500", open === i ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
            <div className="overflow-hidden">
              <div className="pb-5 text-[14px] leading-relaxed text-ink/75">{it.content}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
