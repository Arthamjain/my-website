import type { Metadata } from "next";
import { notFound } from "next/navigation";

const DOCS: Record<string, { title: string; body: string[] }> = {
  privacy: {
    title: "Privacy policy",
    body: [
      "We collect only what we need to deliver your order and look after you afterwards: your name, email, phone number and delivery address, and what you bought.",
      "We count visits to this site with an anonymous, first-party visit identifier that expires after 30 minutes of inactivity. We do not use advertising trackers and we do not sell or share your data.",
      "If you join our letter list, we use your email only to send those letters. Every letter has an unsubscribe link.",
      "You can ask us to see, correct or delete your information at any time by writing to us.",
    ],
  },
  terms: {
    title: "Terms of sale",
    body: [
      "Prices are in Indian rupees and include GST. We confirm your order by email; the contract is formed when we dispatch it.",
      "Because every cover is made by hand, small variations in pattern and colour are part of the product and not defects.",
      "Returns and exchanges follow the policy on our Help page. Our liability is limited to the price you paid for the item.",
      "These terms are governed by the laws of India.",
    ],
  },
};

export async function generateMetadata({ params }: PageProps<"/legal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  return { title: DOCS[slug]?.title ?? "Not found" };
}

export default async function LegalPage({ params }: PageProps<"/legal/[slug]">) {
  const { slug } = await params;
  const doc = DOCS[slug];
  if (!doc) notFound();
  return (
    <div className="mx-auto max-w-[720px] px-4 py-12 md:py-16">
      <h1 className="h1">{doc.title}</h1>
      <div className="prose-kaya mt-6">
        {doc.body.map((p) => (
          <p key={p}>{p}</p>
        ))}
      </div>
      <p className="mt-10 text-[13px] text-muted">These are plain-language starting points. Have them reviewed before launch.</p>
    </div>
  );
}
