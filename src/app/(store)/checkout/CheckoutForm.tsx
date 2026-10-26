"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { Lock } from "lucide-react";
import { useCart, track } from "@/store/cart";
import { checkout, getQuote } from "@/app/(store)/actions";
import type { Quote } from "@/lib/orders";
import { cn, formatINR } from "@/lib/utils";
import { useHydrated } from "@/lib/useHydrated";

const STATES = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh",
  "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura",
  "Uttar Pradesh", "Uttarakhand", "West Bengal",
];

type Prefill = { email: string; name: string; phone: string; address: Record<string, string> | null };
type Settings = { codEnabled: boolean; codFee: number; express: number; standard: number; threshold: number };

function Section({ n, title, children }: { n: number; title: string; children: React.ReactNode }) {
  return (
    <section className="border-b border-line pb-8">
      <h2 className="flex items-center gap-3 font-serif text-2xl">
        <span className="grid h-7 w-7 place-items-center rounded-full bg-ink font-sans text-[12px] text-paper">{n}</span>
        {title}
      </h2>
      <div className="mt-5">{children}</div>
    </section>
  );
}

function Radio({ checked, onChange, title, detail, right }: { checked: boolean; onChange: () => void; title: string; detail?: string; right?: string }) {
  return (
    <label className={cn("flex cursor-pointer items-start gap-3 rounded-xl border bg-white p-4 transition", checked ? "border-ink ring-1 ring-ink" : "border-line hover:border-ink/40")}>
      <input type="radio" checked={checked} onChange={onChange} className="mt-1 accent-ink" />
      <span className="flex-1">
        <span className="block text-[14.5px] font-medium">{title}</span>
        {detail && <span className="block text-[13px] text-muted">{detail}</span>}
      </span>
      {right && <span className="text-[14px]">{right}</span>}
    </label>
  );
}

export default function CheckoutForm({ prefill, settings, signedIn }: { prefill: Prefill; settings: Settings; signedIn: boolean }) {
  const items = useCart((s) => s.items);
  const clear = useCart((s) => s.clear);
  const router = useRouter();
  const mounted = useHydrated();
  const [f, setF] = useState({
    email: prefill.email,
    name: prefill.name,
    phone: prefill.phone,
    line1: prefill.address?.line1 ?? "",
    line2: prefill.address?.line2 ?? "",
    city: prefill.address?.city ?? "",
    state: prefill.address?.state ?? "",
    pincode: prefill.address?.pincode ?? "",
    marketing: true,
    note: "",
    gift: "",
  });
  const [shipping, setShipping] = useState<"standard" | "express">("standard");
  const [payment, setPayment] = useState<"cod" | "upi" | "card">(settings.codEnabled ? "upi" : "upi");
  const [codeInput, setCodeInput] = useState("");
  const [code, setCode] = useState("");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [error, setError] = useState("");
  const [showGift, setShowGift] = useState(false);
  const [placing, startPlacing] = useTransition();
  const tracked = useRef(false);

  useEffect(() => {
    if (!mounted) return;
    if (!tracked.current && items.length) {
      tracked.current = true;
      track("begin_checkout", { value: items.reduce((n, i) => n + i.price * i.qty, 0) });
    }
    let cancelled = false;
    getQuote(
      items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
      { code, shippingMethod: shipping, payment },
    ).then((q) => !cancelled && setQuote(q));
    return () => {
      cancelled = true;
    };
  }, [items, code, shipping, payment, mounted]);

  if (!mounted) return <div className="min-h-[60vh]" />;
  if (!items.length)
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="h1">Your bag is empty</h1>
        <Link href="/shop" className="btn btn-primary mt-8">
          Browse journals
        </Link>
      </div>
    );

  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setF((s) => ({ ...s, [k]: e.target.type === "checkbox" ? (e.target as HTMLInputElement).checked : e.target.value }));

  const place = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    startPlacing(async () => {
      const res = await checkout({
        cart: items.map((i) => ({ variantId: i.variantId, qty: i.qty })),
        email: f.email,
        name: f.name,
        phone: f.phone,
        address: { line1: f.line1, line2: f.line2, city: f.city, state: f.state, pincode: f.pincode, country: "India" },
        shippingMethod: shipping,
        payment,
        code,
        note: f.note,
        giftMessage: showGift ? f.gift : "",
        marketing: f.marketing,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      clear();
      router.push(`/order/${res.number}?t=${res.token}&new=1`);
    });
  };

  return (
    <form onSubmit={place} className="mx-auto grid max-w-[1180px] gap-10 px-4 pb-16 pt-8 md:px-8 lg:grid-cols-[1fr_420px] lg:gap-16">
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="h1">Checkout</h1>
          <span className="flex items-center gap-1.5 text-[12.5px] text-muted">
            <Lock size={14} /> Secure checkout
          </span>
        </div>

        <Section n={1} title="Contact">
          <div className="grid gap-4">
            <label>
              <span className="label">Email</span>
              <input type="email" required autoComplete="email" value={f.email} onChange={set("email")} className="input" />
            </label>
            <label className="flex items-center gap-2 text-[13.5px] text-muted">
              <input type="checkbox" checked={f.marketing} onChange={set("marketing")} className="accent-ink" />
              Send me letters about new batches (no more than two a month)
            </label>
            {!signedIn && (
              <p className="text-[13px] text-muted">
                Have an account?{" "}
                <Link href="/account/login?next=/checkout" className="underline">
                  Sign in
                </Link>{" "}
                — or check out as a guest.
              </p>
            )}
          </div>
        </Section>

        <Section n={2} title="Delivery address">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="sm:col-span-2">
              <span className="label">Full name</span>
              <input required autoComplete="name" value={f.name} onChange={set("name")} className="input" />
            </label>
            <label className="sm:col-span-2">
              <span className="label">Address</span>
              <input required autoComplete="address-line1" placeholder="House number, street, area" value={f.line1} onChange={set("line1")} className="input" />
            </label>
            <label className="sm:col-span-2">
              <span className="label">Apartment, landmark (optional)</span>
              <input autoComplete="address-line2" value={f.line2} onChange={set("line2")} className="input" />
            </label>
            <label>
              <span className="label">PIN code</span>
              <input required inputMode="numeric" maxLength={6} autoComplete="postal-code" value={f.pincode} onChange={(e) => setF((s) => ({ ...s, pincode: e.target.value.replace(/\D/g, "") }))} className="input" />
            </label>
            <label>
              <span className="label">City</span>
              <input required autoComplete="address-level2" value={f.city} onChange={set("city")} className="input" />
            </label>
            <label>
              <span className="label">State</span>
              <select required value={f.state} onChange={set("state")} className="input">
                <option value="">Choose…</option>
                {STATES.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </label>
            <label>
              <span className="label">Phone (for delivery updates)</span>
              <input required type="tel" inputMode="tel" autoComplete="tel" placeholder="10-digit mobile" value={f.phone} onChange={set("phone")} className="input" />
            </label>
          </div>
        </Section>

        <Section n={3} title="Shipping">
          <div className="grid gap-3">
            <Radio
              checked={shipping === "standard"}
              onChange={() => setShipping("standard")}
              title="Standard · 3–6 working days"
              detail={`Free over ${formatINR(settings.threshold)}`}
              right={quote && shipping === "standard" ? (quote.shipping ? formatINR(quote.shipping) : "Free") : formatINR(settings.standard)}
            />
            <Radio checked={shipping === "express"} onChange={() => setShipping("express")} title="Express · 1–3 working days" detail="Metro cities, dispatched the same day before 2 pm" right={formatINR(settings.express)} />
          </div>
          {showGift ? (
            <label className="mt-4 block">
              <span className="label">Gift message — handwritten on a card in the box</span>
              <textarea rows={3} maxLength={300} value={f.gift} onChange={set("gift")} className="input" placeholder="Prices are never included in gift boxes." />
            </label>
          ) : (
            <button type="button" onClick={() => setShowGift(true)} className="mt-4 text-[13.5px] underline underline-offset-2">
              + This is a gift — add a handwritten note
            </button>
          )}
        </Section>

        <Section n={4} title="Payment">
          <p className="mb-4 rounded-lg bg-[#FFF6E5] px-4 py-3 text-[13px] text-[#7a5410]">
            Online payments are in <strong>test mode</strong> — UPI and card orders are confirmed without charging anything.
          </p>
          <div className="grid gap-3">
            <Radio checked={payment === "upi"} onChange={() => setPayment("upi")} title="UPI" detail="Google Pay, PhonePe, Paytm or any UPI app" />
            <Radio checked={payment === "card"} onChange={() => setPayment("card")} title="Credit or debit card" detail="Visa, Mastercard, RuPay" />
            {settings.codEnabled && (
              <Radio checked={payment === "cod"} onChange={() => setPayment("cod")} title="Cash on delivery" detail="Pay when it arrives" right={`+ ${formatINR(settings.codFee)}`} />
            )}
          </div>
        </Section>

        <label className="block">
          <span className="label">Order notes (optional)</span>
          <textarea rows={2} value={f.note} onChange={set("note")} className="input" placeholder="Delivery instructions, monogram initials for sets…" />
        </label>
      </div>

      {/* summary */}
      <aside className="h-fit rounded-2xl bg-linen/70 p-6 lg:sticky lg:top-24">
        <h2 className="font-serif text-2xl">Order summary</h2>
        <ul className="mt-5 space-y-4">
          {(quote?.lines ?? []).map((l) => (
            <li key={l.variantId} className="flex gap-3">
              <div className="card-photo relative h-16 w-14 shrink-0 rounded-lg">
                {l.image && <Image src={l.image} alt="" fill sizes="56px" className="object-contain p-1" />}
                <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-ink px-1 text-[11px] text-paper">{l.qty}</span>
              </div>
              <div className="min-w-0 flex-1 text-[13.5px]">
                <p className="font-medium">{l.title}</p>
                <p className="text-muted">{l.variantTitle}</p>
              </div>
              <p className="text-[13.5px] tabular-nums">{formatINR(l.lineTotal)}</p>
            </li>
          ))}
        </ul>
        {quote?.problems.map((p) => (
          <p key={p} className="mt-3 rounded-lg bg-white px-3 py-2 text-[13px] text-bad">
            {p}
          </p>
        ))}

        <div className="mt-6 flex gap-2">
          <input value={codeInput} onChange={(e) => setCodeInput(e.target.value.toUpperCase())} placeholder="Discount code" className="input" aria-label="Discount code" />
          <button type="button" onClick={() => setCode(codeInput.trim())} className="btn btn-ghost shrink-0 bg-white px-4">
            Apply
          </button>
        </div>
        {code && quote?.discountError && <p className="mt-2 text-[13px] text-bad">{quote.discountError}</p>}
        {quote?.discountCode && (
          <p className="mt-2 text-[13px] text-ok">
            {quote.discountCode} applied{" "}
            <button
              type="button"
              className="ml-1 text-muted underline"
              onClick={() => {
                setCode("");
                setCodeInput("");
              }}
            >
              remove
            </button>
          </p>
        )}

        {quote && (
          <dl className="mt-6 space-y-2 text-[14px]">
            <div className="flex justify-between">
              <dt>Subtotal</dt>
              <dd className="tabular-nums">{formatINR(quote.subtotal)}</dd>
            </div>
            {quote.discount > 0 && (
              <div className="flex justify-between text-ok">
                <dt>Discount</dt>
                <dd className="tabular-nums">− {formatINR(quote.discount)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt>Shipping</dt>
              <dd className="tabular-nums">{quote.shipping ? formatINR(quote.shipping) : "Free"}</dd>
            </div>
            {quote.codFee > 0 && (
              <div className="flex justify-between">
                <dt>Cash on delivery fee</dt>
                <dd className="tabular-nums">{formatINR(quote.codFee)}</dd>
              </div>
            )}
            <div className="flex justify-between border-t border-ink/10 pt-3 text-[17px] font-medium">
              <dt>Total</dt>
              <dd className="tabular-nums">{formatINR(quote.total)}</dd>
            </div>
            <p className="text-[12px] text-muted">Includes {formatINR(quote.tax)} GST</p>
          </dl>
        )}

        {error && <p className="mt-4 rounded-lg bg-white px-3 py-2 text-[13px] text-bad">{error}</p>}
        <button disabled={placing || !quote || !quote.lines.length} className="btn btn-primary mt-6 w-full py-4 text-[15px]">
          {placing ? "Placing your order…" : payment === "cod" ? `Place order · ${formatINR(quote?.total ?? 0)}` : `Pay ${formatINR(quote?.total ?? 0)}`}
        </button>
        <p className="mt-3 text-center text-[12px] text-muted">
          By placing your order you agree to our{" "}
          <Link href="/legal/terms" className="underline">
            terms
          </Link>
          .
        </p>
      </aside>
    </form>
  );
}
