"use client";

import Image from "next/image";
import dynamic from "next/dynamic";
import { useState } from "react";
import { Box } from "lucide-react";
import type { Fabric } from "@/components/three/NotebookModel";
import { cn } from "@/lib/utils";

const NotebookViewer = dynamic(() => import("@/components/three/NotebookViewer"), {
  ssr: false,
  loading: () => <div className="grid h-full place-items-center text-[13px] text-muted">Setting up the studio…</div>,
});

export default function Gallery({ images, title, fabric }: { images: { url: string; alt: string }[]; title: string; fabric?: (Fabric & { ribbon: string }) | null }) {
  const [active, setActive] = useState(0);
  const show3d = active === -1;
  const img = images[active] ?? images[0];
  const isRender = (u: string) => u.includes("/renders/");
  return (
    <div className="flex flex-col-reverse gap-3 md:flex-row">
      <div className="no-scrollbar flex gap-2 overflow-x-auto md:w-[84px] md:flex-col md:overflow-visible">
        {images.map((im, i) => (
          <button
            key={im.url + i}
            onClick={() => setActive(i)}
            aria-label={`Show image ${i + 1}`}
            className={cn("card-photo relative h-[84px] w-[70px] shrink-0 overflow-hidden rounded-lg ring-1 transition md:h-[100px] md:w-[84px]", active === i ? "ring-ink" : "ring-transparent hover:ring-line")}
          >
            <Image src={im.url} alt="" fill sizes="84px" className={isRender(im.url) ? "object-contain p-1" : "object-cover"} />
          </button>
        ))}
        {fabric && (
          <button
            onClick={() => setActive(-1)}
            className={cn("grid h-[84px] w-[70px] shrink-0 place-items-center rounded-lg bg-ink text-paper ring-1 md:h-[100px] md:w-[84px]", show3d ? "ring-brass ring-2" : "ring-transparent")}
          >
            <span className="flex flex-col items-center gap-1 text-[11px]">
              <Box size={18} strokeWidth={1.5} />
              3D view
            </span>
          </button>
        )}
      </div>
      <div className="card-photo grain relative aspect-[4/5] flex-1 overflow-hidden rounded-2xl">
        {show3d && fabric ? (
          <NotebookViewer fabric={fabric} ribbon={fabric.ribbon} />
        ) : (
          img && (
            <Image
              key={img.url}
              src={img.url}
              alt={img.alt || title}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className={isRender(img.url) ? "object-contain p-6 md:p-10" : "object-cover"}
            />
          )
        )}
        {fabric && !show3d && (
          <button onClick={() => setActive(-1)} className="absolute bottom-4 left-4 flex items-center gap-2 rounded-full bg-paper/90 px-4 py-2 text-[13px] shadow-sm backdrop-blur hover:bg-white">
            <Box size={16} strokeWidth={1.5} /> Turn it in 3D
          </button>
        )}
      </div>
    </div>
  );
}
