"use client";

import { useActionState, useState } from "react";
import { saveDiscount, type AdminState } from "@/app/admin/actions";
import { btnPrimary, field, fieldLabel } from "./ui";

export default function DiscountForm() {
  const [state, action, pending] = useActionState<AdminState, FormData>(saveDiscount, {});
  const [kind, setKind] = useState("percent");
  return (
    <form action={action} className="grid gap-3" key={state.message}>
      <label>
        <span className={fieldLabel}>Code</span>
        <input name="code" required placeholder="DIWALI15" className={`${field} uppercase`} />
      </label>
      <label>
        <span className={fieldLabel}>Type</span>
        <select name="kind" value={kind} onChange={(e) => setKind(e.target.value)} className={field}>
          <option value="percent">Percentage off</option>
          <option value="fixed">Fixed amount off (₹)</option>
          <option value="shipping">Free shipping</option>
        </select>
      </label>
      {kind !== "shipping" && (
        <label>
          <span className={fieldLabel}>{kind === "percent" ? "Percent" : "Amount (₹)"}</span>
          <input name="value" type="number" min={1} required className={field} />
        </label>
      )}
      <div className="grid grid-cols-2 gap-3">
        <label>
          <span className={fieldLabel}>Minimum order (₹)</span>
          <input name="min_subtotal" type="number" min={0} defaultValue={0} className={field} />
        </label>
        <label>
          <span className={fieldLabel}>Usage limit</span>
          <input name="usage_limit" type="number" min={1} placeholder="Unlimited" className={field} />
        </label>
      </div>
      <label>
        <span className={fieldLabel}>Ends on (optional)</span>
        <input name="ends_at" type="date" className={field} />
      </label>
      {state.error && <p className="text-[13px] text-bad">{state.error}</p>}
      {state.ok && <p className="text-[13px] text-ok">{state.message}</p>}
      <button disabled={pending} className={btnPrimary}>
        {pending ? "Creating…" : "Create code"}
      </button>
    </form>
  );
}
