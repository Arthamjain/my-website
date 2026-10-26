import "server-only";
import { all, run } from "./db";
import { DEFAULT_SETTINGS } from "./seed";

export type StoreSettings = {
  store_name: string;
  support_email: string;
  support_phone: string;
  free_shipping_threshold: number;
  standard_shipping: number;
  express_shipping: number;
  cod_fee: number;
  cod_enabled: boolean;
  gst_rate: number;
  announcement: string;
};

export async function getSettings(): Promise<StoreSettings> {
  const rows = await all<{ key: string; value: string }>("SELECT key, value FROM settings");
  const m = { ...DEFAULT_SETTINGS, ...Object.fromEntries(rows.map((r) => [r.key, r.value])) };
  return {
    store_name: m.store_name,
    support_email: m.support_email,
    support_phone: m.support_phone,
    free_shipping_threshold: Number(m.free_shipping_threshold) || 0,
    standard_shipping: Number(m.standard_shipping) || 0,
    express_shipping: Number(m.express_shipping) || 0,
    cod_fee: Number(m.cod_fee) || 0,
    cod_enabled: m.cod_enabled === "1",
    gst_rate: Number(m.gst_rate) || 0,
    announcement: m.announcement,
  };
}

export async function saveSettings(values: Record<string, string>) {
  for (const [k, v] of Object.entries(values)) {
    if (!(k in DEFAULT_SETTINGS)) continue;
    await run("INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value", [k, v]);
  }
}
