import Link from "next/link";
import NewsletterForm from "./NewsletterForm";

const COLS = [
  {
    title: "Shop",
    links: [
      ["/shop?category=journal", "Journals"],
      ["/shop?category=cover", "Covers"],
      ["/shop?category=set", "Gifts & sets"],
      ["/shop?category=refill", "Refills"],
      ["/shop?category=accessory", "Accessories"],
    ],
  },
  {
    title: "KĀYA",
    links: [
      ["/story", "The story"],
      ["/makers", "Our makers"],
      ["/journal", "Journal"],
      ["/contact", "Contact"],
    ],
  },
  {
    title: "Help",
    links: [
      ["/track", "Track an order"],
      ["/help#shipping", "Shipping"],
      ["/help#returns", "Returns & exchanges"],
      ["/help", "FAQ"],
      ["/account", "Your account"],
    ],
  },
];

export default function Footer({ email, phone }: { email: string; phone: string }) {
  return (
    <footer className="mt-24 bg-ink text-paper">
      <div className="mx-auto grid max-w-[1320px] gap-12 px-4 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)] md:px-8">
        <div>
          <p className="font-serif text-4xl tracking-[0.06em]">KĀYA</p>
          <p className="mt-4 max-w-sm text-[14px] leading-relaxed text-paper/70">
            Letters from the workshop: new batches before they sell out, stories from the looms, and the occasional page from our own notebooks.
          </p>
          <div className="mt-6">
            <NewsletterForm dark />
          </div>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <p className="text-[12px] font-medium uppercase tracking-[0.14em] text-paper/50">{c.title}</p>
            <ul className="mt-4 space-y-2.5">
              {c.links.map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-[14px] text-paper/85 hover:text-paper">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="border-t border-paper/10">
        <div className="mx-auto flex max-w-[1320px] flex-col gap-3 px-4 py-6 text-[12.5px] text-paper/55 md:flex-row md:items-center md:justify-between md:px-8">
          <p>© {new Date().getFullYear()} KĀYA. Made slowly in India.</p>
          <p className="flex flex-wrap gap-x-5 gap-y-1">
            <a href={`mailto:${email}`}>{email}</a>
            <span>{phone}</span>
            <Link href="/legal/privacy">Privacy</Link>
            <Link href="/legal/terms">Terms</Link>
          </p>
        </div>
      </div>
    </footer>
  );
}
