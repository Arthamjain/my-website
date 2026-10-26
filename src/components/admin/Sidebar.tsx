"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { BarChart3, Boxes, ExternalLink, Home, Inbox, LogOut, Menu, Package, Percent, Settings, ShoppingCart, Star, Users, X } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV = [
  { href: "", label: "Dashboard", icon: Home },
  { href: "/orders", label: "Orders", icon: ShoppingCart, badge: "orders" },
  { href: "/products", label: "Products", icon: Package },
  { href: "/inventory", label: "Inventory", icon: Boxes },
  { href: "/customers", label: "Customers", icon: Users },
  { href: "/discounts", label: "Discounts", icon: Percent },
  { href: "/analytics", label: "Analytics", icon: BarChart3 },
  { href: "/reviews", label: "Reviews", icon: Star, badge: "reviews" },
  { href: "/messages", label: "Messages", icon: Inbox, badge: "messages" },
  { href: "/settings", label: "Settings", icon: Settings },
] as const;

export default function Sidebar({
  base,
  email,
  storeName,
  badges,
  logout,
}: {
  base: string;
  email: string;
  storeName: string;
  badges: Record<string, number>;
  logout: () => Promise<void>;
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const isActive = (href: string) => (href === "" ? pathname === base : pathname.startsWith(base + href));

  const nav = (
    <nav className="flex flex-col gap-0.5">
      {NAV.map(({ href, label, icon: Icon, ...rest }) => {
        const count = "badge" in rest ? badges[rest.badge] : 0;
        return (
          <Link
            key={href}
            href={base + href}
            onClick={() => setOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 text-[14px] transition",
              isActive(href) ? "bg-white font-medium text-ink shadow-sm ring-1 ring-black/5" : "text-ink/70 hover:bg-white/60 hover:text-ink",
            )}
          >
            <Icon size={17} strokeWidth={1.6} />
            <span className="flex-1">{label}</span>
            {count > 0 && <span className="rounded-full bg-clay px-1.5 py-0.5 text-[11px] font-semibold leading-none text-white">{count}</span>}
          </Link>
        );
      })}
    </nav>
  );

  const footer = (
    <div className="mt-auto space-y-1 border-t border-black/5 pt-4 text-[13px]">
      <a href="/" target="_blank" className="flex items-center gap-2 rounded-lg px-3 py-2 text-ink/70 hover:bg-white/60">
        <ExternalLink size={15} /> View store
      </a>
      <form action={logout}>
        <button className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-ink/70 hover:bg-white/60">
          <LogOut size={15} /> Sign out
        </button>
      </form>
      <p className="truncate px-3 pt-2 text-[11.5px] text-muted">{email}</p>
    </div>
  );

  return (
    <>
      <aside className="sticky top-0 hidden h-screen print:!hidden w-60 shrink-0 flex-col border-r border-black/5 bg-[#F1EEE8] p-4 lg:flex">
        <div className="mb-6 flex items-center gap-2 px-3 pt-1">
          <span className="font-serif text-2xl tracking-[0.06em]">{storeName}</span>
          <span className="rounded bg-ink px-1.5 py-0.5 text-[10px] uppercase tracking-wider text-paper">Admin</span>
        </div>
        {nav}
        {footer}
      </aside>

      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-black/5 bg-[#F1EEE8] px-4 py-3 lg:hidden print:hidden">
        <button onClick={() => setOpen(true)} aria-label="Menu">
          <Menu size={22} />
        </button>
        <span className="font-serif text-xl tracking-[0.06em]">{storeName} · Admin</span>
        <span className="w-6" />
      </div>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-black/30" onClick={() => setOpen(false)} />
          <aside className="absolute inset-y-0 left-0 flex w-72 flex-col bg-[#F1EEE8] p-4">
            <button className="mb-4 self-end" onClick={() => setOpen(false)} aria-label="Close">
              <X size={20} />
            </button>
            {nav}
            {footer}
          </aside>
        </div>
      )}
    </>
  );
}
