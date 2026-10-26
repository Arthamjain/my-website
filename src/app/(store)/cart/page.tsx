import type { Metadata } from "next";
import CartView from "./CartView";
import { getSettings } from "@/lib/settings";

export const metadata: Metadata = { title: "Your bag" };

export default async function CartPage() {
  const s = await getSettings();
  return <CartView threshold={s.free_shipping_threshold} />;
}
