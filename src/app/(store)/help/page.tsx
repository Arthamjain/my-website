import type { Metadata } from "next";
import Link from "next/link";
import Accordion from "@/components/store/Accordion";
import { getSettings } from "@/lib/settings";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = { title: "Help & FAQ" };

export default async function HelpPage() {
  const s = await getSettings();
  const faq = [
    ["How does the cover come off?", "Lift the brass rod straight up out of the spine. The cover and the page block separate. Slide the new cover or refill in, and push the rod back down until it clicks. No tools, about thirty seconds."],
    ["Will any refill fit my journal?", "Every KĀYA refill fits every KĀYA cover of the same size. A5 fits A5, Pocket fits Pocket."],
    ["Is the paper fountain-pen friendly?", "Yes. 120gsm cotton rag paper holds fountain pen ink without feathering, and takes light watercolour and brush pens. Very wet nibs may show faintly on the reverse."],
    ["Why does my cover look different from the photo?", "Every cover is hand-printed or hand-woven, so motifs land slightly differently and natural dyes vary between batches. We think that’s the best part, but if it isn’t what you expected you can return it."],
    ["Do you ship outside India?", "Not yet. We’re working on it — join the letter list and we’ll tell you when."],
    ["Can I add a monogram?", "Sets include a brass monogram plate. Add the initials (up to three letters) in the order notes at checkout."],
  ];
  return (
    <div className="mx-auto max-w-[860px] px-4 py-12 md:px-8 md:py-16">
      <h1 className="h1">Help</h1>
      <p className="mt-3 text-[15px] text-muted">
        Can&apos;t find what you need? <Link href="/contact" className="text-ink underline">Write to us</Link> — a real person replies within a working day.
      </p>

      <h2 className="h2 mt-14">Questions</h2>
      <div className="mt-6">
        <Accordion items={faq.map(([title, a]) => ({ title, content: <p>{a}</p> }))} defaultOpen={-1} />
      </div>

      <h2 id="shipping" className="h2 mt-16 scroll-mt-28">Shipping</h2>
      <div className="prose-kaya">
        <p>Orders leave our studio within one working day. Standard delivery takes 3–6 working days anywhere in India and costs {formatINR(s.standard_shipping)}, or nothing on orders over {formatINR(s.free_shipping_threshold)}.</p>
        <p>Express delivery ({formatINR(s.express_shipping)}) reaches most metro cities in 1–3 working days. Cash on delivery is available on most PIN codes for a {formatINR(s.cod_fee)} handling fee.</p>
        <p>You&apos;ll get a tracking number by email as soon as your parcel is picked up. You can also <Link href="/track" className="underline">track your order here</Link>.</p>
      </div>

      <h2 id="returns" className="h2 mt-16 scroll-mt-28">Returns & exchanges</h2>
      <div className="prose-kaya">
        <p>If something isn&apos;t right, you can return unused items in their original packaging within 7 days of delivery for a full refund. Write to us with your order number and we&apos;ll arrange a pickup.</p>
        <p>Covers can be exchanged for another cloth within the same window — the brass rod makes it easy to check the fit before you decide.</p>
        <p>Journals that have been written in can&apos;t be returned, but if anything breaks within a year — the rod, the binding, a seam — we&apos;ll repair or replace it.</p>
      </div>
    </div>
  );
}
