"use client";

import { useActionState, useState } from "react";
import { Star } from "lucide-react";
import { submitReview, type FormState } from "@/app/(store)/actions";

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5 text-brass" aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} size={size} fill={i <= Math.round(value) ? "currentColor" : "none"} strokeWidth={1.5} />
      ))}
    </span>
  );
}

export default function ReviewForm({ productId }: { productId: number }) {
  const [state, action, pending] = useActionState<FormState, FormData>(submitReview, {});
  const [rating, setRating] = useState(0);
  const [open, setOpen] = useState(false);
  if (state.ok) return <p className="rounded-xl bg-linen p-5 text-[14px]">{state.message}</p>;
  if (!open)
    return (
      <button onClick={() => setOpen(true)} className="btn btn-ghost">
        Write a review
      </button>
    );
  return (
    <form action={action} className="grid max-w-xl gap-4 rounded-2xl border border-line bg-white p-6">
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />
      <div>
        <span className="label">Your rating</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <button type="button" key={i} onClick={() => setRating(i)} aria-label={`${i} stars`} className="text-brass">
              <Star size={26} fill={i <= rating ? "currentColor" : "none"} strokeWidth={1.4} />
            </button>
          ))}
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <label>
          <span className="label">Name</span>
          <input name="name" className="input" required />
        </label>
        <label>
          <span className="label">City (optional)</span>
          <input name="location" className="input" />
        </label>
      </div>
      <label>
        <span className="label">Email used for your order (not shown — marks the review as verified)</span>
        <input name="email" type="email" className="input" />
      </label>
      <label>
        <span className="label">Title</span>
        <input name="title" className="input" />
      </label>
      <label>
        <span className="label">Review</span>
        <textarea name="body" rows={4} className="input" required />
      </label>
      {state.error && <p className="text-[13px] text-bad">{state.error}</p>}
      <button disabled={pending} className="btn btn-primary justify-self-start">
        {pending ? "Sending…" : "Submit review"}
      </button>
    </form>
  );
}
