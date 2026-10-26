import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageHeader({ title, sub, actions }: { title: string; sub?: React.ReactNode; actions?: React.ReactNode }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
      <div>
        <h1 className="text-[24px] font-semibold tracking-tight">{title}</h1>
        {sub && <p className="mt-1 text-[13.5px] text-muted">{sub}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export function Card({ title, action, children, className, pad = true }: { title?: string; action?: React.ReactNode; children: React.ReactNode; className?: string; pad?: boolean }) {
  return (
    <section className={cn("rounded-xl border border-black/[0.07] bg-white shadow-[0_1px_2px_rgba(0,0,0,0.03)]", className)}>
      {title && (
        <div className="flex items-center justify-between border-b border-black/[0.06] px-5 py-3.5">
          <h2 className="text-[14px] font-semibold">{title}</h2>
          {action}
        </div>
      )}
      <div className={pad ? "p-5" : ""}>{children}</div>
    </section>
  );
}

const TONES: Record<string, string> = {
  green: "bg-[#E4F0E6] text-[#2F5E3A]",
  amber: "bg-[#FBEFD5] text-[#80570F]",
  red: "bg-[#F8E1DE] text-[#8F2E25]",
  blue: "bg-[#E2E9F5] text-[#2C4573]",
  grey: "bg-[#ECE9E4] text-[#5A544D]",
};

export function Badge({ tone = "grey", children }: { tone?: keyof typeof TONES; children: React.ReactNode }) {
  return <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-[11.5px] font-medium", TONES[tone])}>{children}</span>;
}

export const paymentTone = (s: string) => (s === "paid" ? "green" : s === "refunded" ? "grey" : "amber");
export const fulfilTone = (s: string) => (s === "delivered" ? "green" : s === "shipped" ? "blue" : s === "packed" ? "amber" : "red");
export const fulfilLabel: Record<string, string> = { unfulfilled: "Unfulfilled", packed: "Packed", shipped: "Shipped", delivered: "Delivered" };

export function Tabs({ items, active }: { items: { href: string; label: string; count?: number }[]; active: string }) {
  return (
    <div className="mb-4 flex flex-wrap gap-1 border-b border-black/[0.07]">
      {items.map((t) => (
        <Link
          key={t.href}
          href={t.href}
          className={cn("-mb-px border-b-2 px-3 py-2 text-[13.5px]", active === t.label ? "border-ink font-medium" : "border-transparent text-muted hover:text-ink")}
        >
          {t.label}
          {t.count != null && <span className="ml-1.5 text-[12px] text-muted">{t.count}</span>}
        </Link>
      ))}
    </div>
  );
}

export const dateTime = (s: string) =>
  new Date(s.includes("T") ? s : s.replace(" ", "T") + "Z").toLocaleString("en-IN", { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });
export const dateOnly = (s: string) =>
  new Date(s.includes("T") ? s : s.replace(" ", "T") + "Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export const btn = "inline-flex items-center justify-center gap-1.5 rounded-lg px-3.5 py-2 text-[13.5px] font-medium transition";
export const btnPrimary = `${btn} bg-ink text-white hover:bg-ink/85`;
export const btnSecondary = `${btn} border border-black/10 bg-white hover:bg-[#F6F4F0]`;
export const btnDanger = `${btn} border border-[#E5C3BE] bg-white text-[#8F2E25] hover:bg-[#FBEDEB]`;
export const field = "w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-[14px] outline-none focus:border-ink focus:ring-2 focus:ring-black/5";
export const fieldLabel = "mb-1 block text-[12.5px] font-medium text-ink/75";
