"use client";

import { fabricById, type FabricId } from "@/data/fabrics";
import { sound } from "@/lib/soundEngine";
import { cn } from "@/lib/utils";

interface Props {
  id: FabricId;
  active?: boolean;
  onSelect?: (id: FabricId) => void;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/** A fabric chip that previews the weave through the cursor loupe. */
export default function Swatch({ id, active, onSelect, size = "md", className }: Props) {
  const f = fabricById[id];
  const dims = { sm: "h-6 w-6", md: "h-8 w-8", lg: "h-11 w-11" }[size];
  return (
    <button
      type="button"
      data-cursor="swatch"
      data-fabric={id}
      aria-label={`${f.persona} — ${f.name}`}
      aria-pressed={active}
      onMouseEnter={() => sound.linenBrush()}
      onClick={() => onSelect?.(id)}
      className={cn(
        "relative shrink-0 rounded-[2px] p-[3px] transition-[box-shadow,transform] duration-500 ease-silk",
        active ? "shadow-[0_0_0_1px_#1C1917]" : "shadow-[0_0_0_1px_rgba(28,25,23,0.1)] hover:-translate-y-0.5",
        className,
      )}
    >
      <span
        className={cn("block rounded-[1px]", dims)}
        style={{
          background: `linear-gradient(135deg, ${f.color} 0 62%, ${f.colorSecondary} 62% 70%, ${f.color} 70%)`,
        }}
      />
    </button>
  );
}
