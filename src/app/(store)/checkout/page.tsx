import type { Metadata } from "next";
import CheckoutForm from "./CheckoutForm";
import { getCustomer } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { get } from "@/lib/db";

export const metadata: Metadata = { title: "Checkout", robots: { index: false } };

export default async function CheckoutPage() {
  const [customer, settings] = await Promise.all([getCustomer(), getSettings()]);
  // Prefill from the customer's last order so returning buyers don't retype their address.
  const last = customer
    ? await get<{ address: string; phone: string; name: string }>("SELECT address, phone, name FROM orders WHERE customer_id = ? ORDER BY id DESC LIMIT 1", [customer.id])
    : undefined;
  return (
    <CheckoutForm
      prefill={{
        email: customer?.email ?? "",
        name: last?.name ?? customer?.name ?? "",
        phone: last?.phone ?? customer?.phone ?? "",
        address: last ? JSON.parse(last.address) : null,
      }}
      settings={{
        codEnabled: settings.cod_enabled,
        codFee: settings.cod_fee,
        express: settings.express_shipping,
        standard: settings.standard_shipping,
        threshold: settings.free_shipping_threshold,
      }}
      signedIn={!!customer}
    />
  );
}
