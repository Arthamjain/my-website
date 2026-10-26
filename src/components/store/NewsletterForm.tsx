"use client";

import { useActionState } from "react";
import { subscribe, type FormState } from "@/app/(store)/actions";

export default function NewsletterForm({ source = "footer", dark }: { source?: string; dark?: boolean }) {
  const [state, action, pending] = useActionState<FormState, FormData>(subscribe, {});
  if (state.ok) return <p className={dark ? "text-paper/85" : "text-muted"}>{state.message}</p>;
  return (
    <form action={action} className="flex w-full max-w-md flex-col gap-2 sm:flex-row">
      <input type="hidden" name="source" value={source} />
      <label className="sr-only" htmlFor={`nl-${source}`}>
        Email
      </label>
      <input
        id={`nl-${source}`}
        name="email"
        type="email"
        required
        placeholder="Your email"
        className={dark ? "input border-paper/25 bg-transparent text-paper placeholder:text-paper/50 focus:border-paper" : "input"}
      />
      <button disabled={pending} className={dark ? "btn btn-light shrink-0" : "btn btn-primary shrink-0"}>
        {pending ? "Adding…" : "Subscribe"}
      </button>
      {state.error && <p className="text-[13px] text-bad sm:hidden">{state.error}</p>}
    </form>
  );
}
