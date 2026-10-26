import { create } from "zustand";
import { fabricById, type FabricId, type Format, type Ruling, type Tier } from "@/data/fabrics";
import { setSoundEnabled, sound } from "@/lib/soundEngine";

export type SectionId = "hero" | "diagnosis" | "anatomy" | "ledger" | "atelier" | "reviews";

export interface CartItem {
  key: string;
  kind: "ritual" | "sleeve";
  title: string;
  subtitle: string;
  fabricIds: FabricId[];
  tier?: Tier;
  format?: Format;
  ruling?: Ruling;
  monogram?: string;
  unitPrice: number;
  qty: number;
  tag?: "pairing" | "palette";
}

interface KayaState {
  activeFabric: FabricId;
  isOpen: boolean;
  ruling: Ruling;
  format: Format;
  monogram: string;
  soundOn: boolean;
  loupe: boolean;
  section: SectionId;
  ledgerStage: number;
  flippedPages: number;
  introDone: boolean;
  hover3D: boolean;
  tier: Tier;
  wardrobe: [FabricId, FabricId, FabricId];
  cart: CartItem[];
  cartOpen: boolean;
  checkoutOpen: boolean;
  passportOpen: boolean;

  setFabric: (id: FabricId) => void;
  toggleOpen: () => void;
  setOpen: (open: boolean) => void;
  setRuling: (r: Ruling) => void;
  setFormat: (f: Format) => void;
  setMonogram: (m: string) => void;
  toggleSound: () => void;
  toggleLoupe: () => void;
  setSection: (s: SectionId) => void;
  setLedgerStage: (n: number) => void;
  flipPage: () => void;
  setIntroDone: () => void;
  setHover3D: (v: boolean) => void;
  setTier: (t: Tier) => void;
  setWardrobeSlot: (slot: number, id: FabricId) => void;

  addItem: (item: Omit<CartItem, "key" | "qty">) => void;
  removeItem: (key: string) => void;
  setQty: (key: string, qty: number) => void;
  setCartOpen: (v: boolean) => void;
  setCheckoutOpen: (v: boolean) => void;
  setPassportOpen: (v: boolean) => void;
  clearCart: () => void;
}

let keySeq = 0;

export const useKaya = create<KayaState>((set, get) => ({
  activeFabric: "dabu",
  isOpen: false,
  ruling: "dot",
  format: "a5",
  monogram: "",
  soundOn: false,
  loupe: false,
  section: "hero",
  ledgerStage: 0,
  flippedPages: 0,
  introDone: false,
  hover3D: false,
  tier: 2,
  wardrobe: ["dabu", "mashru", "tussar"],
  cart: [],
  cartOpen: false,
  checkoutOpen: false,
  passportOpen: false,

  setFabric: (id) => {
    if (get().activeFabric === id) return;
    sound.fabricRustle();
    set({ activeFabric: id });
  },
  toggleOpen: () => {
    sound.pageTurn();
    set((s) => ({ isOpen: !s.isOpen, loupe: false, flippedPages: s.isOpen ? 0 : s.flippedPages }));
  },
  setOpen: (open) => {
    if (get().isOpen === open) return;
    sound.pageTurn();
    set({ isOpen: open, loupe: false, flippedPages: open ? get().flippedPages : 0 });
  },
  setRuling: (ruling) => {
    sound.pageTurn();
    set({ ruling });
  },
  setFormat: (format) => set({ format }),
  setMonogram: (m) => set({ monogram: m.replace(/[^a-zA-Z]/g, "").slice(0, 3).toUpperCase() }),
  toggleSound: () => {
    const next = !get().soundOn;
    setSoundEnabled(next);
    set({ soundOn: next });
    if (next) sound.brassClick();
  },
  toggleLoupe: () => set((s) => ({ loupe: !s.loupe, isOpen: false })),
  setSection: (section) => set({ section }),
  setLedgerStage: (ledgerStage) => set({ ledgerStage }),
  flipPage: () => {
    sound.pageTurn();
    set((s) => ({ flippedPages: (s.flippedPages + 1) % 4 }));
  },
  setIntroDone: () => set({ introDone: true }),
  setHover3D: (hover3D) => set({ hover3D }),
  setTier: (tier) => set({ tier }),
  setWardrobeSlot: (slot, id) =>
    set((s) => {
      const next = [...s.wardrobe] as [FabricId, FabricId, FabricId];
      next[slot] = id;
      return { wardrobe: next };
    }),

  addItem: (item) => {
    sound.confirm();
    set((s) => ({ cart: [...s.cart, { ...item, key: `k${++keySeq}`, qty: 1 }] }));
  },
  removeItem: (key) => set((s) => ({ cart: s.cart.filter((i) => i.key !== key) })),
  setQty: (key, qty) =>
    set((s) => ({ cart: s.cart.map((i) => (i.key === key ? { ...i, qty: Math.max(1, Math.min(9, qty)) } : i)) })),
  setCartOpen: (cartOpen) => set({ cartOpen }),
  setCheckoutOpen: (checkoutOpen) => set({ checkoutOpen, cartOpen: false }),
  setPassportOpen: (passportOpen) => set({ passportOpen }),
  clearCart: () => set({ cart: [] }),
}));

export const cartCount = (cart: CartItem[]) => cart.reduce((n, i) => n + i.qty, 0);
export const cartTotal = (cart: CartItem[]) => cart.reduce((n, i) => n + i.unitPrice * i.qty, 0);
export const activeFabricOf = (s: KayaState) => fabricById[s.activeFabric];
