"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Download, Printer, ShieldCheck, X } from "lucide-react";
import { useKaya, cartTotal, type CartItem } from "@/store/useKaya";
import { fabricById, type FabricId } from "@/data/fabrics";
import { computeImpact } from "@/lib/impact";
import { formatINR, SILK, cn } from "@/lib/utils";
import CurtainButton from "./CurtainButton";

type Delivery = { name: string; email: string; phone: string; address: string; city: string; pin: string };
type Order = {
  serial: string;
  date: string;
  items: CartItem[];
  total: number;
  monogram: string;
  name: string;
  fabricIds: FabricId[];
  impact: ReturnType<typeof computeImpact>;
};

const emptyDelivery: Delivery = { name: "", email: "", phone: "", address: "", city: "", pin: "" };

function validateDelivery(d: Delivery) {
  const e: Partial<Record<keyof Delivery, string>> = {};
  if (d.name.trim().length < 2) e.name = "Please share your full name.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) e.email = "That email doesn't look quite right.";
  if (!/^[6-9]\d{9}$/.test(d.phone.replace(/^\+?91/, "").replace(/\D/g, ""))) e.phone = "Enter a 10-digit Indian mobile number.";
  if (d.address.trim().length < 8) e.address = "Add house, street and area.";
  if (d.city.trim().length < 2) e.city = "Which city?";
  if (!/^\d{6}$/.test(d.pin)) e.pin = "PIN codes have six digits.";
  return e;
}

const steps = ["Delivery", "Impact & Payment", "Confirmation"];

function Field({
  label,
  error,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string; error?: string }) {
  return (
    <label className={cn("block", className)}>
      <span className="meta text-[9px] text-muted">{label}</span>
      <input className="field" {...props} />
      <span className={cn("block h-4 pt-1 text-[11px] text-[#9B3B2A] transition-opacity", error ? "opacity-100" : "opacity-0")}>{error}</span>
    </label>
  );
}

function certificateSvg(o: Order) {
  const covers = o.fabricIds.map((id) => fabricById[id]);
  const rows = covers
    .map(
      (f, i) =>
        `<text x="80" y="${430 + i * 34}" font-family="Georgia, serif" font-size="20" fill="#1C1917">${f.name}</text>` +
        `<text x="720" y="${430 + i * 34}" text-anchor="end" font-family="monospace" font-size="12" fill="#655E57">${f.cluster.toUpperCase()} · ${f.loomHours} HRS · ${f.coordinates}</text>`,
    )
    .join("");
  const h = 560 + covers.length * 34;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="${h}" viewBox="0 0 800 ${h}">
<rect width="800" height="${h}" fill="#FAF7F2"/>
<rect x="24" y="24" width="752" height="${h - 48}" fill="none" stroke="#B8934A" stroke-dasharray="8 6"/>
<text x="400" y="100" text-anchor="middle" font-family="monospace" font-size="12" letter-spacing="2" fill="#655E57">OFFICIAL ARTISAN PROVENANCE &amp; LOOM CERTIFICATE</text>
<text x="400" y="170" text-anchor="middle" font-family="Georgia, serif" font-size="46" font-style="italic" fill="#1C1917">KĀYA · काया</text>
<text x="400" y="230" text-anchor="middle" font-family="Georgia, serif" font-size="22" fill="#1C1917">Woven for ${escapeXml(o.name)}</text>
<text x="400" y="290" text-anchor="middle" font-family="Georgia, serif" font-size="64" font-style="italic" fill="#B8934A">${o.monogram ? o.monogram.split("").join("·") : "✦"}</text>
<text x="400" y="340" text-anchor="middle" font-family="monospace" font-size="12" fill="#655E57">SERIAL ${o.serial} · ${o.date.toUpperCase()}</text>
<line x1="80" y1="380" x2="720" y2="380" stroke="#1C1917" stroke-opacity="0.12"/>
${rows}
<text x="400" y="${h - 90}" text-anchor="middle" font-family="monospace" font-size="12" fill="#655E57">${o.impact.hours} LOOM HOURS · ${formatINR(o.impact.amount)} ALLOCATED TO ARTISAN CLUSTERS</text>
<text x="400" y="${h - 62}" text-anchor="middle" font-family="monospace" font-size="12" fill="#655E57">100% HANDLOOM MARK VERIFIED</text>
</svg>`;
}

function escapeXml(s: string) {
  return s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" })[c] as string);
}

function Certificate({ order }: { order: Order }) {
  const covers = order.fabricIds.map((id) => fabricById[id]);
  return (
    <div className="printable relative border border-dashed border-brass/70 bg-paper p-6 md:p-8">
      <p className="meta text-center text-muted">Official Artisan Provenance &amp; Loom Certificate</p>
      <p className="mt-3 text-center font-serif text-4xl italic">KĀYA · काया</p>
      <p className="mt-2 text-center font-serif text-lg">Woven for {order.name}</p>
      <p className="mt-3 text-center font-serif text-5xl italic text-brass">{order.monogram ? order.monogram.split("").join("·") : "✦"}</p>
      <p className="meta mt-3 text-center text-muted">
        Serial {order.serial} · {order.date}
      </p>
      <ul className="mt-6 divide-y divide-ink/10 border-y hairline">
        {covers.map((f) => (
          <li key={f.id} className="flex flex-col gap-1 py-3 md:flex-row md:items-baseline md:justify-between">
            <span className="flex items-center gap-2 font-serif text-lg">
              <span className="h-3 w-3" style={{ background: f.color }} />
              {f.name}
            </span>
            <span className="meta text-[9px] text-muted">
              {f.cluster} · {f.loomLabel} · {f.coordinates}
            </span>
          </li>
        ))}
      </ul>
      <p className="meta mt-4 text-center text-[9px] text-muted">
        {order.impact.hours} loom hours · {formatINR(order.impact.amount)} allocated to artisan clusters · 100% Handloom Mark verified
      </p>
    </div>
  );
}

export default function CheckoutModal() {
  const open = useKaya((s) => s.checkoutOpen);
  const cart = useKaya((s) => s.cart);
  const monogram = useKaya((s) => s.monogram);
  const { setCheckoutOpen, clearCart } = useKaya.getState();

  const [step, setStep] = useState(0);
  const [delivery, setDelivery] = useState<Delivery>(emptyDelivery);
  const [errors, setErrors] = useState<Partial<Record<keyof Delivery, string>>>({});
  const [method, setMethod] = useState<"upi" | "card">("upi");
  const [upi, setUpi] = useState("");
  const [card, setCard] = useState({ number: "", expiry: "", cvc: "" });
  const [payError, setPayError] = useState("");
  const [processing, setProcessing] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);

  const close = () => {
    setCheckoutOpen(false);
    if (order) {
      setStep(0);
      setOrder(null);
      setUpi("");
      setCard({ number: "", expiry: "", cvc: "" });
    }
  };

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && !processing && useKaya.getState().setCheckoutOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, processing]);

  const total = cartTotal(cart);
  const impact = computeImpact(cart);

  const submitDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateDelivery(delivery);
    setErrors(errs);
    if (Object.keys(errs).length === 0) setStep(1);
  };

  const pay = (e: React.FormEvent) => {
    e.preventDefault();
    if (method === "upi" && !/^[\w.-]{2,}@[a-zA-Z]{2,}$/.test(upi)) return setPayError("Enter a UPI ID like name@okbank.");
    if (method === "card") {
      const digits = card.number.replace(/\s/g, "");
      const [mm, yy] = card.expiry.split("/").map(Number);
      if (!/^\d{15,16}$/.test(digits)) return setPayError("Card numbers have 15–16 digits.");
      if (!mm || mm > 12 || !yy) return setPayError("Expiry should look like MM/YY.");
      if (!/^\d{3,4}$/.test(card.cvc)) return setPayError("CVC is 3–4 digits.");
    }
    setPayError("");
    setProcessing(true);
    window.setTimeout(() => {
      const ids = [...new Set(cart.flatMap((i) => i.fabricIds))];
      setOrder({
        serial: `KY-26-${String(Math.floor(10000 + Math.random() * 89999))}-${ids.map((id) => fabricById[id].index).join("")}`,
        date: new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" }),
        items: cart,
        total,
        monogram: cart.find((i) => i.monogram)?.monogram ?? monogram,
        name: delivery.name.trim(),
        fabricIds: ids,
        impact,
      });
      clearCart();
      setProcessing(false);
      setStep(2);
    }, 1500);
  };

  const download = () => {
    if (!order) return;
    const blob = new Blob([certificateSvg(order)], { type: "image/svg+xml" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `KAYA-Loom-Certificate-${order.serial}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[75] flex items-end justify-center md:items-center">
          <motion.div
            className="absolute inset-0 bg-ink/30 backdrop-blur-[3px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !processing && close()}
          />
          <motion.div
            role="dialog"
            aria-label="Checkout"
            initial={{ y: 60, opacity: 0, clipPath: "inset(12% 0 0 0)" }}
            animate={{ y: 0, opacity: 1, clipPath: "inset(0% 0 0 0)" }}
            exit={{ y: 40, opacity: 0 }}
            transition={{ duration: 0.9, ease: SILK }}
            className="relative flex max-h-[92vh] w-full max-w-3xl flex-col border hairline bg-paper"
          >
            <div className="flex items-center justify-between border-b hairline px-6 py-4">
              <ol className="flex gap-4 md:gap-8">
                {steps.map((label, i) => (
                  <li key={label} className={cn("meta flex items-center gap-2", i === step ? "text-ink" : "text-muted/60")}>
                    <span className={cn("grid h-5 w-5 place-items-center border text-[9px]", i < step ? "border-brass bg-brass text-paper" : "border-current")}>
                      {i < step ? <Check size={10} strokeWidth={1.5} /> : i + 1}
                    </span>
                    <span className="hidden sm:inline">{label}</span>
                  </li>
                ))}
              </ol>
              <button onClick={close} disabled={processing} aria-label="Close checkout" className="grid h-9 w-9 place-items-center border hairline hover:border-ink">
                <X size={15} strokeWidth={1.25} />
              </button>
            </div>

            <div className="overflow-y-auto px-6 py-6 md:px-10 md:py-8" data-lenis-prevent>
              <AnimatePresence mode="wait">
                {step === 0 && (
                  <motion.form
                    key="d"
                    onSubmit={submitDelivery}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.6, ease: SILK }}
                    noValidate
                  >
                    <p className="display-sm">
                      Where should your <em className="italic">ritual</em> arrive?
                    </p>
                    <div className="mt-8 grid gap-x-8 gap-y-2 md:grid-cols-2">
                      {(
                        [
                          ["name", "Full name", "text", "name"],
                          ["email", "Email", "email", "email"],
                          ["phone", "Mobile (+91)", "tel", "tel"],
                          ["city", "City", "text", "address-level2"],
                          ["address", "House, street & area", "text", "street-address"],
                          ["pin", "PIN code", "text", "postal-code"],
                        ] as const
                      ).map(([key, label, type, auto]) => (
                        <Field
                          key={key}
                          label={label}
                          type={type}
                          autoComplete={auto}
                          inputMode={key === "pin" || key === "phone" ? "numeric" : undefined}
                          value={delivery[key]}
                          error={errors[key]}
                          onChange={(e) => setDelivery((d) => ({ ...d, [key]: key === "pin" ? e.target.value.replace(/\D/g, "").slice(0, 6) : e.target.value }))}
                        />
                      ))}
                    </div>
                    <div className="mt-6 flex flex-col-reverse items-start justify-between gap-4 border-t hairline pt-6 md:flex-row md:items-center">
                      <span className="meta text-muted">
                        {cart.length} piece{cart.length === 1 ? "" : "s"} · {formatINR(total)}
                      </span>
                      <CurtainButton type="submit" label="Continue to Impact" />
                    </div>
                  </motion.form>
                )}

                {step === 1 && (
                  <motion.form
                    key="p"
                    onSubmit={pay}
                    initial={{ opacity: 0, x: 24 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -24 }}
                    transition={{ duration: 0.6, ease: SILK }}
                    noValidate
                  >
                    <p className="display-sm">
                      Verify your <em className="italic">impact.</em>
                    </p>
                    <div className="mt-6 border hairline bg-linen/60 p-5">
                      <p className="meta flex items-center gap-2 text-brass">
                        <ShieldCheck size={14} strokeWidth={1.25} /> NGO impact verification
                      </p>
                      <ul className="mt-3 space-y-2">
                        {impact.lines.map((l) => (
                          <li key={l.ngo} className="flex items-baseline justify-between gap-4 text-[13px]">
                            <span className="flex items-center gap-2">
                              <span className="h-2 w-2" style={{ background: l.color }} />
                              {l.ngo} <span className="meta text-[9px] text-muted">{l.cluster}</span>
                            </span>
                            <span className="font-serif text-lg">{formatINR(l.amount)}</span>
                          </li>
                        ))}
                      </ul>
                      <p className="meta mt-4 text-[9px] text-muted">
                        {impact.hours} fair-wage loom hours · 72% of cover margin returned · 100% Handloom Mark
                      </p>
                    </div>

                    <div className="mt-8 flex gap-2">
                      {(["upi", "card"] as const).map((m) => (
                        <button
                          type="button"
                          key={m}
                          onClick={() => {
                            setMethod(m);
                            setPayError("");
                          }}
                          className={cn("meta h-10 border px-5 transition-colors", method === m ? "border-ink bg-ink text-paper" : "border-ink/15 text-muted hover:border-ink")}
                        >
                          {m === "upi" ? "UPI" : "Card"}
                        </button>
                      ))}
                    </div>
                    <div className="mt-6 grid gap-x-8 md:grid-cols-3">
                      {method === "upi" ? (
                        <Field label="UPI ID" placeholder="yourname@okbank" value={upi} onChange={(e) => setUpi(e.target.value.trim())} className="md:col-span-2" />
                      ) : (
                        <>
                          <Field
                            label="Card number"
                            inputMode="numeric"
                            autoComplete="cc-number"
                            placeholder="4242 4242 4242 4242"
                            value={card.number}
                            onChange={(e) =>
                              setCard((c) => ({
                                ...c,
                                number: e.target.value.replace(/\D/g, "").slice(0, 16).replace(/(\d{4})(?=\d)/g, "$1 "),
                              }))
                            }
                          />
                          <Field
                            label="Expiry"
                            placeholder="MM/YY"
                            autoComplete="cc-exp"
                            value={card.expiry}
                            onChange={(e) => {
                              const v = e.target.value.replace(/\D/g, "").slice(0, 4);
                              setCard((c) => ({ ...c, expiry: v.length > 2 ? `${v.slice(0, 2)}/${v.slice(2)}` : v }));
                            }}
                          />
                          <Field
                            label="CVC"
                            inputMode="numeric"
                            autoComplete="cc-csc"
                            value={card.cvc}
                            onChange={(e) => setCard((c) => ({ ...c, cvc: e.target.value.replace(/\D/g, "").slice(0, 4) }))}
                          />
                        </>
                      )}
                    </div>
                    <p className={cn("h-5 text-[12px] text-[#9B3B2A]", !payError && "invisible")}>{payError || "."}</p>
                    <p className="meta mt-2 text-[9px] text-muted">Demonstration checkout — no payment is processed and no card data leaves this page.</p>
                    <div className="mt-6 flex flex-col-reverse items-start justify-between gap-4 border-t hairline pt-6 md:flex-row md:items-center">
                      <button type="button" onClick={() => setStep(0)} className="meta text-muted hover:text-ink">
                        ← Delivery
                      </button>
                      <CurtainButton type="submit" disabled={processing} label={processing ? "Verifying with your bank…" : `Pay ${formatINR(total)}`} />
                    </div>
                  </motion.form>
                )}

                {step === 2 && order && (
                  <motion.div key="c" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: SILK }}>
                    <p className="meta text-brass">Order confirmed</p>
                    <p className="display-sm mt-2">
                      Thank you, {order.name.split(" ")[0]}. Your covers are <em className="italic">on the loom.</em>
                    </p>
                    <p className="mt-3 text-[14px] text-muted">
                      A confirmation is on its way to {delivery.email}. Total paid {formatINR(order.total)}.
                    </p>
                    <div className="mt-8">
                      <Certificate order={order} />
                    </div>
                    <div className="mt-6 flex flex-wrap gap-3">
                      <CurtainButton label="Print Certificate" variant="ghost" onClick={() => window.print()} icon={<Printer size={14} strokeWidth={1.25} />} />
                      <CurtainButton label="Download" variant="ghost" onClick={download} icon={<Download size={14} strokeWidth={1.25} />} />
                      <CurtainButton label="Return to KĀYA" onClick={close} />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
