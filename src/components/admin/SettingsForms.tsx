"use client";

import { useActionState, useState, useTransition } from "react";
import { loadSampleData, removeSampleData, updateSettings, type AdminState } from "@/app/admin/actions";
import type { StoreSettings } from "@/lib/settings";
import { btnDanger, btnPrimary, btnSecondary, field, fieldLabel } from "./ui";

export function SettingsForm({ s }: { s: StoreSettings }) {
  const [state, action, pending] = useActionState<AdminState, FormData>(updateSettings, {});
  const input = (name: keyof StoreSettings, label: string, type = "text") => (
    <label>
      <span className={fieldLabel}>{label}</span>
      <input name={name} type={type} defaultValue={String(s[name])} className={field} />
    </label>
  );
  return (
    <form action={action} className="grid gap-4">
      <div className="grid gap-4 sm:grid-cols-2">
        {input("store_name", "Store name")}
        {input("support_email", "Support email", "email")}
        {input("support_phone", "Support phone")}
        {input("gst_rate", "GST rate included in prices (%)", "number")}
      </div>
      {input("announcement", "Announcement bar (leave empty to hide)")}
      <div className="grid gap-4 sm:grid-cols-4">
        {input("free_shipping_threshold", "Free shipping over (₹)", "number")}
        {input("standard_shipping", "Standard shipping (₹)", "number")}
        {input("express_shipping", "Express shipping (₹)", "number")}
        {input("cod_fee", "COD fee (₹)", "number")}
      </div>
      <label className="flex items-center gap-2 text-[13.5px]">
        <input type="checkbox" name="cod_enabled" defaultChecked={s.cod_enabled} /> Offer cash on delivery
      </label>
      <div className="flex items-center gap-3">
        <button disabled={pending} className={btnPrimary}>
          {pending ? "Saving…" : "Save settings"}
        </button>
        {state.ok && <span className="text-[13px] text-ok">{state.message}</span>}
        {state.error && <span className="text-[13px] text-bad">{state.error}</span>}
      </div>
    </form>
  );
}

export function SampleDataButtons({ loaded }: { loaded: boolean }) {
  const [msg, setMsg] = useState<AdminState>({});
  const [pending, start] = useTransition();
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        <button disabled={pending || loaded} className={btnSecondary} onClick={() => start(async () => setMsg(await loadSampleData()))}>
          {pending ? "Working…" : "Load sample data"}
        </button>
        <button disabled={pending || !loaded} className={btnDanger} onClick={() => start(async () => setMsg(await removeSampleData()))}>
          Remove sample data
        </button>
      </div>
      {msg.message && <p className="mt-3 text-[13px] text-ok">{msg.message}</p>}
      {msg.error && <p className="mt-3 text-[13px] text-bad">{msg.error}</p>}
    </div>
  );
}
