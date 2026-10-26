"use client";

import { useActionState } from "react";
import { adminLogin, type AdminState } from "../actions";
import { btnPrimary, field, fieldLabel } from "@/components/admin/ui";

export default function LoginForm() {
  const [state, action, pending] = useActionState<AdminState, FormData>(adminLogin, {});
  return (
    <form action={action} className="grid gap-4">
      <label>
        <span className={fieldLabel}>Email</span>
        <input name="email" type="email" required autoComplete="username" className={field} />
      </label>
      <label>
        <span className={fieldLabel}>Password</span>
        <input name="password" type="password" required autoComplete="current-password" className={field} />
      </label>
      {state.error && <p className="text-[13px] text-bad">{state.error}</p>}
      <button disabled={pending} className={`${btnPrimary} py-2.5`}>
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
