"use client";

import { useRef } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "ink" | "ghost" | "brass";

interface Props {
  label: string;
  onClick?: () => void;
  variant?: Variant;
  className?: string;
  type?: "button" | "submit";
  disabled?: boolean;
  icon?: React.ReactNode;
  full?: boolean;
}

const styles: Record<Variant, { base: string; curtain: string; hover: string; icon: string }> = {
  ink: { base: "bg-ink text-paper border-ink", curtain: "bg-brass", hover: "text-ink", icon: "group-hover:text-ink" },
  ghost: { base: "bg-transparent text-ink border-ink/25", curtain: "bg-ink", hover: "text-paper", icon: "group-hover:text-paper" },
  brass: { base: "bg-brass text-paper border-brass", curtain: "bg-ink", hover: "text-paper", icon: "group-hover:text-paper" },
};

/** Rolling split-text: each glyph rides up 100% with a tiny stagger. */
function RollingText({ text, hoverClass }: { text: string; hoverClass: string }) {
  return (
    <span className="relative inline-flex" aria-hidden>
      {text.split("").map((ch, i) => {
        const glyph = ch === " " ? " " : ch;
        return (
          <span key={i} className="relative inline-block h-[1.2em] overflow-hidden leading-[1.2em]">
            <span
              className="flex flex-col transition-transform duration-[650ms] ease-silk group-hover:-translate-y-1/2"
              style={{ transitionDelay: `${i * 14}ms` }}
            >
              <span>{glyph}</span>
              <span className={hoverClass}>{glyph}</span>
            </span>
          </span>
        );
      })}
    </span>
  );
}

export default function CurtainButton({ label, onClick, variant = "ink", className, type = "button", disabled, icon, full }: Props) {
  const ref = useRef<HTMLButtonElement>(null);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 280, damping: 26, mass: 0.9 });
  const y = useSpring(my, { stiffness: 280, damping: 26, mass: 0.9 });
  const s = styles[variant];

  const onMove = (e: React.MouseEvent) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    const dx = e.clientX - (r.left + r.width / 2);
    const dy = e.clientY - (r.top + r.height / 2);
    mx.set(Math.max(-8, Math.min(8, dx * 0.18)));
    my.set(Math.max(-8, Math.min(8, dy * 0.3)));
  };
  const reset = () => {
    mx.set(0);
    my.set(0);
  };

  return (
    <motion.button
      ref={ref}
      type={type}
      disabled={disabled}
      onClick={onClick}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ x, y }}
      data-cursor="cta"
      aria-label={label}
      className={cn(
        "group relative isolate inline-flex h-12 items-center justify-center gap-3 overflow-hidden rounded-[2px] border px-7 meta text-[11px] disabled:opacity-40",
        s.base,
        full && "w-full",
        className,
      )}
    >
      <span
        aria-hidden
        className={cn(
          "absolute inset-x-0 bottom-0 -z-10 h-[140%] translate-y-full rounded-t-[50%] transition-[transform,border-radius] duration-[800ms] ease-silk group-hover:translate-y-0 group-hover:rounded-t-none group-disabled:hidden",
          s.curtain,
        )}
      />
      <RollingText text={label} hoverClass={s.hover} />
      {icon && <span className={cn("transition-colors duration-500", s.icon)}>{icon}</span>}
    </motion.button>
  );
}
