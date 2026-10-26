"use client";

import { useActionState } from "react";
import type { FormState } from "@/app/(store)/actions";

/** Small wrapper for server-action forms that show an error or a success message. */
export default function SimpleForm({
  action,
  children,
  submit,
  pendingLabel = "One moment…",
  className = "grid gap-4",
}: {
  action: (s: FormState, fd: FormData) => Promise<FormState>;
  children: React.ReactNode;
  submit: string;
  pendingLabel?: string;
  className?: string;
}) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(action, {});
  if (state.ok && state.message) return <p className="rounded-xl bg-linen p-5 text-[14.5px]">{state.message}</p>;
  return (
    <form action={formAction} className={className}>
      {children}
      {state.error && <p className="text-[13.5px] text-bad">{state.error}</p>}
      <button disabled={pending} className="btn btn-primary justify-self-start">
        {pending ? pendingLabel : submit}
      </button>
    </form>
  );
}
