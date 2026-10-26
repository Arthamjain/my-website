"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

export type CartItem = {
  variantId: number;
  productId: number;
  slug: string;
  title: string;
  variantTitle: string;
  price: number;
  image: string;
  qty: number;
};

type CartState = {
  items: CartItem[];
  open: boolean;
  add: (item: Omit<CartItem, "qty">, qty?: number) => void;
  setQty: (variantId: number, qty: number) => void;
  remove: (variantId: number) => void;
  clear: () => void;
  setOpen: (open: boolean) => void;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      open: false,
      add: (item, qty = 1) =>
        set((s) => {
          const existing = s.items.find((i) => i.variantId === item.variantId);
          const items = existing
            ? s.items.map((i) => (i.variantId === item.variantId ? { ...i, ...item, qty: Math.min(10, i.qty + qty) } : i))
            : [...s.items, { ...item, qty }];
          return { items, open: true };
        }),
      setQty: (variantId, qty) =>
        set((s) => ({
          items: qty <= 0 ? s.items.filter((i) => i.variantId !== variantId) : s.items.map((i) => (i.variantId === variantId ? { ...i, qty: Math.min(10, qty) } : i)),
        })),
      remove: (variantId) => set((s) => ({ items: s.items.filter((i) => i.variantId !== variantId) })),
      clear: () => set({ items: [] }),
      setOpen: (open) => set({ open }),
    }),
    { name: "kaya-cart", partialize: (s) => ({ items: s.items }) },
  ),
);

export const cartCount = (items: CartItem[]) => items.reduce((n, i) => n + i.qty, 0);
export const cartSubtotal = (items: CartItem[]) => items.reduce((n, i) => n + i.qty * i.price, 0);

/** Fire-and-forget analytics beacon. */
export function track(kind: "page_view" | "product_view" | "add_to_cart" | "begin_checkout", data: { productId?: number; value?: number } = {}) {
  try {
    const body = JSON.stringify({ kind, path: location.pathname, referrer: document.referrer, ...data });
    if (navigator.sendBeacon) navigator.sendBeacon("/api/track", new Blob([body], { type: "application/json" }));
    else fetch("/api/track", { method: "POST", body, headers: { "Content-Type": "application/json" }, keepalive: true });
  } catch {}
}
