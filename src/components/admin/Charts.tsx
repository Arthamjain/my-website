"use client";

import { useState } from "react";
import { formatINR } from "@/lib/utils";

export function AreaChart({
  data,
  valueKey,
  format = "inr",
  height = 220,
  color = "#263859",
}: {
  data: { day: string; [k: string]: number | string }[];
  valueKey: string;
  format?: "inr" | "num";
  height?: number;
  color?: string;
}) {
  const [hover, setHover] = useState<number | null>(null);
  const W = 800;
  const H = height;
  const pad = { t: 12, r: 8, b: 24, l: 8 };
  const vals = data.map((d) => Number(d[valueKey]) || 0);
  const max = Math.max(1, ...vals) * 1.15;
  const x = (i: number) => pad.l + (i / Math.max(1, data.length - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);
  const line = vals.map((v, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(" ");
  const area = `${line} L${x(vals.length - 1)},${H - pad.b} L${x(0)},${H - pad.b} Z`;
  const fmt = (v: number) => (format === "inr" ? formatINR(v) : v.toLocaleString("en-IN"));
  const label = (d: string) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
  const ticks = [0, Math.floor(data.length / 2), data.length - 1];

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="h-auto w-full"
        onMouseLeave={() => setHover(null)}
        onMouseMove={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect();
          const px = ((e.clientX - r.left) / r.width) * W;
          setHover(Math.max(0, Math.min(data.length - 1, Math.round(((px - pad.l) / (W - pad.l - pad.r)) * (data.length - 1)))));
        }}
        role="img"
        aria-label={`Chart of ${valueKey}`}
      >
        <defs>
          <linearGradient id={`g-${valueKey}`} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0" stopColor={color} stopOpacity="0.18" />
            <stop offset="1" stopColor={color} stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={pad.l} x2={W - pad.r} y1={pad.t + f * (H - pad.t - pad.b)} y2={pad.t + f * (H - pad.t - pad.b)} stroke="#000" strokeOpacity="0.05" />
        ))}
        <path d={area} fill={`url(#g-${valueKey})`} />
        <path d={line} fill="none" stroke={color} strokeWidth="2" strokeLinejoin="round" />
        {ticks.map((i) =>
          data[i] ? (
            <text key={i} x={x(i)} y={H - 6} fontSize="11" fill="#8A837B" textAnchor={i === 0 ? "start" : i === data.length - 1 ? "end" : "middle"}>
              {label(data[i].day)}
            </text>
          ) : null,
        )}
        {hover != null && (
          <>
            <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={H - pad.b} stroke={color} strokeOpacity="0.25" />
            <circle cx={x(hover)} cy={y(vals[hover])} r="4" fill="#fff" stroke={color} strokeWidth="2" />
          </>
        )}
      </svg>
      {hover != null && (
        <div
          className="pointer-events-none absolute top-0 -translate-x-1/2 rounded-lg bg-ink px-2.5 py-1.5 text-[12px] text-white shadow"
          style={{ left: `${(x(hover) / W) * 100}%` }}
        >
          <span className="text-white/60">{label(data[hover].day)}</span> · {fmt(vals[hover])}
        </div>
      )}
    </div>
  );
}

export function Funnel({ steps }: { steps: { label: string; n: number }[] }) {
  const top = Math.max(1, steps[0]?.n ?? 1);
  return (
    <ol className="space-y-3">
      {steps.map((s, i) => {
        const prev = i ? steps[i - 1].n : s.n;
        const rate = i && prev ? (s.n / prev) * 100 : null;
        return (
          <li key={s.label}>
            <div className="flex justify-between text-[13px]">
              <span>{s.label}</span>
              <span className="tabular-nums">
                {s.n.toLocaleString("en-IN")}
                {rate != null && <span className="ml-2 text-muted">{rate.toFixed(0)}%</span>}
              </span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-[#EFECE6]">
              <div className="h-full rounded-full bg-indigo" style={{ width: `${Math.max(1.5, (s.n / top) * 100)}%`, opacity: 1 - i * 0.12 }} />
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export function Bars({ rows, format = "num" }: { rows: { label: string; value: number }[]; format?: "num" | "inr" }) {
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-2.5">
      {rows.map((r) => (
        <li key={r.label} className="text-[13px]">
          <div className="flex justify-between gap-3">
            <span className="truncate">{r.label}</span>
            <span className="tabular-nums text-muted">{format === "inr" ? formatINR(r.value) : r.value.toLocaleString("en-IN")}</span>
          </div>
          <div className="mt-1 h-1.5 rounded-full bg-[#EFECE6]">
            <div className="h-full rounded-full bg-moss" style={{ width: `${(r.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
      {rows.length === 0 && <li className="text-[13px] text-muted">No data yet.</li>}
    </ul>
  );
}
