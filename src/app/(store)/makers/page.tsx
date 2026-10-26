import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = { title: "Our makers" };

const CLUSTERS = [
  { cloth: "Indigo Dabu", craft: "Mud-resist block print", region: "Bagru, Rajasthan", hours: 18, img: "/images/fabric/tex-dabu.jpg", slug: "dabu-journal", text: "Clay paste, carved teak blocks and natural indigo. Printers in Bagru stamp each motif by hand and dip the cloth again and again until the blue goes deep." },
  { cloth: "Marigold Mashru", craft: "Ikat-dyed satin weave", region: "Patan, Gujarat", hours: 24, img: "/images/fabric/tex-mashru.jpg", slug: "mashru-journal", text: "The warp threads are tied and dyed before weaving, which is why the stripes blur softly at the edges. A silk face on a cotton back." },
  { cloth: "Raw Tussar", craft: "Hand-spun wild silk", region: "Bhagalpur, Bihar", hours: 16, img: "/images/fabric/tex-tussar.jpg", slug: "tussar-journal", text: "Wild silk spun on the charkha and woven with khadi, left completely undyed. The slubs are the spinner’s marks." },
  { cloth: "Forest Chanderi", craft: "Pit-loom brocade", region: "Chanderi, Madhya Pradesh", hours: 32, img: "/images/fabric/tex-chanderi.jpg", slug: "chanderi-journal", text: "Woven in a pit below the loom to keep the threads supple. Each small gold butti is added by hand with its own shuttle." },
  { cloth: "Rose Jamdani", craft: "Supplementary-weft weave", region: "Nadia, West Bengal", hours: 28, img: "/images/fabric/tex-jamdani.jpg", slug: "jamdani-journal", text: "Motifs are tucked in thread by thread while the cloth is on the loom — not printed, not embroidered. Weavers often work from memory." },
];

export default function MakersPage() {
  return (
    <div>
      <section className="relative">
        <div className="relative h-[62vh] min-h-[420px] w-full overflow-hidden">
          <Image src="/images/loom.jpg" alt="A weaver at a wooden hand loom" fill priority sizes="100vw" className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent" />
        </div>
        <div className="absolute inset-x-0 bottom-0 mx-auto max-w-[1320px] px-4 pb-12 text-white md:px-8">
          <p className="text-[12px] uppercase tracking-[0.14em] text-white/75">Our makers</p>
          <h1 className="h-display mt-3 max-w-3xl">Five regions. Five crafts. A lot of patient hands.</h1>
        </div>
      </section>

      <section className="mx-auto max-w-[760px] px-4 py-20 text-center">
        <p className="font-serif text-[26px] leading-snug md:text-[30px]">
          We don&apos;t design the cloth. We look for crafts that are already beautiful, buy in small runs, and build the journal around them.
        </p>
        <p className="mx-auto mt-6 max-w-lg text-[15px] text-muted">
          Every cover ships with a care card naming the craft, the region and the hours it took — so the person holding it knows where it came from.
        </p>
      </section>

      <section className="mx-auto max-w-[1180px] space-y-20 px-4 md:space-y-28 md:px-8">
        {CLUSTERS.map((c, i) => (
          <div key={c.cloth} className="grid items-center gap-8 md:grid-cols-2 md:gap-16">
            <div className={`relative aspect-[4/3] overflow-hidden rounded-[24px] ${i % 2 ? "md:order-2" : ""}`}>
              <Image src={c.img} alt={`${c.cloth} cloth`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
            </div>
            <div>
              <p className="eyebrow">{c.region}</p>
              <h2 className="h1 mt-2">{c.cloth}</h2>
              <p className="mt-1 font-serif text-[20px] italic text-ink/70">{c.craft}</p>
              <p className="mt-5 text-[15.5px] leading-relaxed text-ink/80">{c.text}</p>
              <p className="hand mt-5 text-[26px] text-indigo">≈ {c.hours} hours of hand work per cover</p>
              <Link href={`/products/${c.slug}`} className="btn btn-ghost mt-6">
                See the {c.cloth} journal
              </Link>
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
