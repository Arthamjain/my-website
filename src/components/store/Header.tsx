"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, Search, ShoppingBag, User, X } from "lucide-react";
import { cartCount, useCart } from "@/store/cart";
import { cn } from "@/lib/utils";
import { useHydrated } from "@/lib/useHydrated";

const NAV = [
  { href: "/shop", label: "Shop all" },
  { href: "/shop?category=journal", label: "Journals" },
  { href: "/shop?category=cover", label: "Covers" },
  { href: "/shop?category=set", label: "Gifts & sets" },
  { href: "/story", label: "The story" },
  { href: "/makers", label: "Makers" },
  { href: "/journal", label: "Journal" },
];

export default function Header({ announcement }: { announcement: string }) {
  const items = useCart((s) => s.items);
  const setOpen = useCart((s) => s.setOpen);
  const mounted = useHydrated();
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();
  // The menu belongs to the page it was opened on, so navigating closes it.
  const [menuPath, setMenuPath] = useState<string | null>(null);
  const menu = menuPath === pathname;
  const setMenu = (open: boolean) => setMenuPath(open ? pathname : null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const count = mounted ? cartCount(items) : 0;

  return (
    <>
      {announcement && (
        <div className="bg-ink px-4 py-2 text-center text-[12.5px] tracking-wide text-paper/90">{announcement}</div>
      )}
      <header
        className={cn(
          "sticky top-0 z-40 border-b transition-colors duration-300",
          scrolled ? "border-line bg-paper/92 backdrop-blur-md" : "border-transparent bg-paper",
        )}
      >
        <div className="mx-auto flex h-16 max-w-[1320px] items-center gap-6 px-4 md:h-[72px] md:px-8">
          <button className="-ml-1 p-1 lg:hidden" aria-label="Open menu" onClick={() => setMenu(true)}>
            <Menu size={22} strokeWidth={1.5} />
          </button>
          <Link href="/" className="font-serif text-[28px] font-medium leading-none tracking-[0.06em]" aria-label="KĀYA home">
            KĀYA
          </Link>
          <nav className="ml-6 hidden items-center gap-7 lg:flex" aria-label="Main">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="link-underline text-[14px] text-ink/85 hover:text-ink">
                {n.label}
              </Link>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-1 md:gap-2">
            <Link href="/search" aria-label="Search" className="rounded-full p-2 hover:bg-linen">
              <Search size={20} strokeWidth={1.5} />
            </Link>
            <Link href="/account" aria-label="Account" className="hidden rounded-full p-2 hover:bg-linen sm:block">
              <User size={20} strokeWidth={1.5} />
            </Link>
            <button onClick={() => setOpen(true)} aria-label={`Bag, ${count} items`} className="relative rounded-full p-2 hover:bg-linen">
              <ShoppingBag size={20} strokeWidth={1.5} />
              {count > 0 && (
                <span className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-clay px-1 text-[10.5px] font-semibold text-white">
                  {count}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* mobile menu */}
      <div className={cn("fixed inset-0 z-50 lg:hidden", menu ? "pointer-events-auto" : "pointer-events-none")} aria-hidden={!menu}>
        <div className={cn("absolute inset-0 bg-ink/30 transition-opacity", menu ? "opacity-100" : "opacity-0")} onClick={() => setMenu(false)} />
        <div
          className={cn(
            "absolute inset-y-0 left-0 flex w-[86%] max-w-sm flex-col bg-paper p-6 transition-transform duration-500",
            menu ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-center justify-between">
            <span className="font-serif text-2xl tracking-[0.06em]">KĀYA</span>
            <button onClick={() => setMenu(false)} aria-label="Close menu">
              <X size={22} strokeWidth={1.5} />
            </button>
          </div>
          <nav className="mt-10 flex flex-col">
            {NAV.map((n) => (
              <Link key={n.href} href={n.href} className="border-b border-line py-4 font-serif text-2xl">
                {n.label}
              </Link>
            ))}
            <Link href="/account" className="py-4 text-[15px] text-muted">
              Account
            </Link>
            <Link href="/track" className="py-1 text-[15px] text-muted">
              Track an order
            </Link>
          </nav>
        </div>
      </div>
    </>
  );
}
