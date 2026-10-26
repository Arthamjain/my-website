import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ProductCard from "@/components/store/ProductCard";
import NewsletterForm from "@/components/store/NewsletterForm";
import { listProducts, MOODS } from "@/lib/catalog";
import { posts } from "@/data/posts";
import { formatINR } from "@/lib/utils";

const MOOD_FABRIC: Record<string, { slug: string; img: string; cloth: string }> = {
  focus: { slug: "dabu-journal", img: "/images/fabric/tex-dabu.jpg", cloth: "Indigo Dabu · Rajasthan" },
  spark: { slug: "mashru-journal", img: "/images/fabric/tex-mashru.jpg", cloth: "Marigold Mashru · Gujarat" },
  rest: { slug: "tussar-journal", img: "/images/fabric/tex-tussar.jpg", cloth: "Raw Tussar · Bihar" },
  authority: { slug: "chanderi-journal", img: "/images/fabric/tex-chanderi.jpg", cloth: "Forest Chanderi · Madhya Pradesh" },
  tender: { slug: "jamdani-journal", img: "/images/fabric/tex-jamdani.jpg", cloth: "Rose Jamdani · West Bengal" },
};

export default async function Home() {
  const [featured, sets] = await Promise.all([listProducts({ featured: true, limit: 8 }), listProducts({ category: "set" })]);
  const bestsellers = featured.filter((p) => p.category === "journal").slice(0, 4);
  const archive = sets.find((s) => s.slug === "chromatic-archive-set");

  return (
    <>
      {/* ---------------------------------- hero ---------------------------------- */}
      <section className="mx-auto grid max-w-[1320px] items-center gap-10 px-4 pb-16 pt-8 md:grid-cols-[1fr_1.05fr] md:px-8 md:pb-24 md:pt-14">
        <div className="max-w-xl">
          <p className="eyebrow">Refillable journals · hand-loomed covers</p>
          <h1 className="h-display mt-5">
            A journal that changes <em className="text-indigo">when you do.</em>
          </h1>
          <p className="mt-6 max-w-md text-[16.5px] leading-relaxed text-ink/75">
            Cotton rag pages on a solid brass spine, dressed in cloth woven by hand in five corners of India. When the paper runs out,
            keep the cover. When your week changes, change the cover.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/shop?category=journal" className="btn btn-primary">
              Shop journals <ArrowRight size={16} />
            </Link>
            <Link href="/story" className="btn btn-ghost">
              Open the story
            </Link>
          </div>
          <dl className="mt-10 grid max-w-md grid-cols-3 gap-4 border-t border-line pt-6 text-[13px]">
            <div>
              <dt className="text-muted">Pages</dt>
              <dd className="mt-1 font-medium">120gsm cotton rag</dd>
            </div>
            <div>
              <dt className="text-muted">Spine</dt>
              <dd className="mt-1 font-medium">Solid brass</dd>
            </div>
            <div>
              <dt className="text-muted">Covers</dt>
              <dd className="mt-1 font-medium">16–32 loom hours</dd>
            </div>
          </dl>
        </div>

        <div className="relative">
          <div className="card-photo grain relative aspect-[5/4] overflow-hidden rounded-[28px]">
            <Image
              src="/images/renders/set-wardrobe.webp"
              alt="Three KĀYA journals in indigo dabu, marigold mashru and raw tussar covers"
              fill
              priority
              sizes="(min-width: 768px) 55vw, 100vw"
              className="object-contain p-4"
            />
            <span className="hand absolute left-[8%] top-[9%] rotate-[-4deg] text-[22px] text-ink/70 md:text-[26px]">solid brass rod ↘</span>
            <span className="hand absolute bottom-[10%] right-[7%] rotate-[3deg] text-[22px] text-ink/70 md:text-[26px]">↖ block-printed in Bagru</span>
          </div>
          <div className="absolute -bottom-8 -left-4 hidden w-[38%] rotate-[-3deg] overflow-hidden rounded-xl border-[6px] border-white shadow-xl md:block">
            <Image src="/images/hands-writing.jpg" alt="Hands writing in a notebook" width={480} height={320} className="h-auto w-full" />
          </div>
        </div>
      </section>

      {/* ---------------------------------- proof ---------------------------------- */}
      <section className="border-y border-line bg-linen/60">
        <ul className="mx-auto grid max-w-[1320px] grid-cols-2 gap-y-4 px-4 py-6 text-center text-[13px] text-ink/80 md:grid-cols-5 md:px-8">
          <li>Hand-loomed in 5 regions</li>
          <li>Refill for {formatINR(450)}, keep the cover</li>
          <li>Fountain-pen safe paper</li>
          <li>Free shipping over {formatINR(1500)}</li>
          <li className="col-span-2 md:col-span-1">Cash on delivery · 7-day returns</li>
        </ul>
      </section>

      {/* ---------------------------------- moods ---------------------------------- */}
      <section className="mx-auto max-w-[1320px] px-4 py-20 md:px-8 md:py-28">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <p className="eyebrow">Choose by feeling, not by colour chart</p>
            <h2 className="h1 mt-3 max-w-2xl">How do you want this season to feel?</h2>
          </div>
          <p className="max-w-sm text-[14.5px] text-muted">
            Each cloth was chosen for the mood it brings to a desk. Start with one, and add another when your weeks start to change.
          </p>
        </div>
        <div className="no-scrollbar -mx-4 mt-10 flex snap-x gap-4 overflow-x-auto px-4 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
          {MOODS.map((m) => {
            const f = MOOD_FABRIC[m.id];
            return (
              <Link key={m.id} href={`/products/${f.slug}`} className="group w-[68%] shrink-0 snap-start sm:w-[40%] md:w-auto">
                <div className="relative aspect-[3/4] overflow-hidden rounded-2xl">
                  <Image src={f.img} alt={f.cloth} fill sizes="(min-width: 768px) 20vw, 70vw" className="object-cover transition duration-700 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/0 to-black/0" />
                  <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                    <p className="hand text-[26px] leading-none">&ldquo;{m.feeling}&rdquo;</p>
                    <p className="mt-2 text-[12px] uppercase tracking-[0.14em] text-white/80">{m.label}</p>
                  </div>
                </div>
                <p className="mt-3 text-[13px] text-muted">{f.cloth}</p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* -------------------------------- bestsellers -------------------------------- */}
      <section className="mx-auto max-w-[1320px] px-4 md:px-8">
        <div className="flex items-end justify-between">
          <h2 className="h2">The journals</h2>
          <Link href="/shop" className="link-underline text-[14px]">
            Shop all
          </Link>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {bestsellers.map((p, i) => (
            <ProductCard key={p.id} p={p} priority={i < 2} />
          ))}
        </div>
      </section>

      {/* -------------------------------- how it works -------------------------------- */}
      <section className="mx-auto mt-28 max-w-[1320px] px-4 md:px-8">
        <div className="grid gap-12 rounded-[28px] bg-ink px-6 py-14 text-paper md:grid-cols-[0.9fr_1.1fr] md:px-14 md:py-20">
          <div>
            <p className="text-[12px] uppercase tracking-[0.14em] text-paper/55">How it works</p>
            <h2 className="h1 mt-3">Thirty seconds. No tools. One satisfying click.</h2>
            <p className="mt-5 max-w-md text-[15.5px] leading-relaxed text-paper/75">
              The brass rod holds everything together. Lift it, and the cover and pages come apart. That&apos;s the whole trick — and why a
              KĀYA can last you a decade instead of a semester.
            </p>
            <Link href="/products/cotton-rag-refill" className="btn btn-light mt-8">
              See refills
            </Link>
          </div>
          <ol className="grid gap-4 sm:grid-cols-3">
            {[
              ["/images/renders/rod.webp", "Lift the rod", "Pull the brass spine up and out."],
              ["/images/renders/mashru-front.webp", "Slide the cover", "Swap to another cloth, or a fresh refill."],
              ["/images/renders/dabu-hero.webp", "Drop it home", "Push the rod back down until it clicks."],
            ].map(([img, t, d], i) => (
              <li key={t} className="rounded-2xl bg-paper/[0.06] p-4">
                <div className="relative aspect-square">
                  <Image src={img} alt="" fill sizes="(min-width: 768px) 18vw, 80vw" className="object-contain" />
                </div>
                <p className="mt-3 text-[12px] text-paper/50">Step {i + 1}</p>
                <p className="font-serif text-xl">{t}</p>
                <p className="mt-1 text-[13px] text-paper/65">{d}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* -------------------------------- makers -------------------------------- */}
      <section className="mx-auto grid max-w-[1320px] items-center gap-10 px-4 py-24 md:grid-cols-2 md:px-8 md:py-32">
        <div className="relative">
          <div className="relative aspect-[4/3] overflow-hidden rounded-[24px]">
            <Image src="/images/loom.jpg" alt="A weaver working at a wooden hand loom" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
          </div>
          <div className="absolute -bottom-6 right-4 w-[42%] overflow-hidden rounded-xl border-[6px] border-white shadow-xl">
            <div className="relative aspect-square">
              <Image src="/images/fabric/tex-dabu.jpg" alt="Indigo dabu block-printed cloth" fill sizes="20vw" className="object-cover" />
            </div>
          </div>
        </div>
        <div className="md:pl-10">
          <p className="eyebrow">The people behind the cloth</p>
          <h2 className="h1 mt-3">Every cover is somebody&apos;s eighteen hours.</h2>
          <p className="mt-5 max-w-lg text-[15.5px] leading-relaxed text-ink/75">
            We buy cloth in small batches from craft clusters in Rajasthan, Gujarat, Bihar, Madhya Pradesh and West Bengal. Each journal carries a care card naming the craft, the region and the hours it took.
          </p>
          <div className="mt-8 flex gap-3">
            <Link href="/makers" className="btn btn-primary">
              Meet the makers
            </Link>
            <Link href="/story" className="btn btn-ghost">
              Our story
            </Link>
          </div>
        </div>
      </section>

      {/* -------------------------------- gift -------------------------------- */}
      {archive && (
        <section className="mx-auto max-w-[1320px] px-4 md:px-8">
          <Link href={`/products/${archive.slug}`} className="group grid items-center overflow-hidden rounded-[28px] bg-linen md:grid-cols-2">
            <div className="relative aspect-[5/4]">
              <Image src="/images/renders/set-archive.webp" alt="All five KĀYA covers" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-contain p-6 transition duration-700 group-hover:scale-[1.03]" />
            </div>
            <div className="p-8 md:p-14">
              <p className="eyebrow">For collectors and very good presents</p>
              <h2 className="h1 mt-3">The Complete Archive</h2>
              <p className="mt-4 max-w-md text-[15px] leading-relaxed text-ink/75">
                All five covers, an A5 journal, a teakwood desk cradle and a brass monogram plate — in one box.
              </p>
              <p className="mt-6 text-[17px]">
                <span className="mr-2 text-muted line-through">{formatINR(archive.compare_at ?? 0)}</span>
                <span className="font-medium">{formatINR(archive.price)}</span>
                <span className="ml-3 rounded-full bg-clay px-2.5 py-1 text-[12px] text-white">
                  Save {formatINR((archive.compare_at ?? 0) - archive.price)}
                </span>
              </p>
              <span className="btn btn-primary mt-8">See what&apos;s inside</span>
            </div>
          </Link>
        </section>
      )}

      {/* -------------------------------- in use -------------------------------- */}
      <section className="mx-auto max-w-[1320px] px-4 py-24 md:px-8">
        <div className="flex items-end justify-between">
          <h2 className="h2">Made to be written in</h2>
          <p className="hidden max-w-xs text-right text-[13.5px] text-muted md:block">Mornings, margins, lists, letters. A good journal disappears into the day.</p>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-3 md:grid-cols-4 md:grid-rows-2 md:gap-4">
          {[
            ["/images/writing-croissant.jpg", "Writing at a desk with coffee and a croissant", "md:col-span-2 md:row-span-2"],
            ["/images/fountain-script.jpg", "Fountain pen on a handwritten page", ""],
            ["/images/pen-petal.jpg", "Fountain pen resting beside a flower petal", ""],
            ["/images/hands-marble.jpg", "Hands holding a notebook on a marble table", ""],
            ["/images/sketch-pages.jpg", "Sketches in an open notebook", ""],
          ].map(([src, alt, cls]) => (
            <div key={src} className={`relative aspect-square overflow-hidden rounded-2xl ${cls}`}>
              <Image src={src} alt={alt} fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover transition duration-700 hover:scale-105" />
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------- journal -------------------------------- */}
      <section className="mx-auto max-w-[1320px] px-4 md:px-8">
        <div className="flex items-end justify-between">
          <h2 className="h2">From the journal</h2>
          <Link href="/journal" className="link-underline text-[14px]">
            All stories
          </Link>
        </div>
        <div className="mt-8 grid gap-8 md:grid-cols-3">
          {posts.map((p) => (
            <Link key={p.slug} href={`/journal/${p.slug}`} className="group">
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <Image src={p.image} alt="" fill sizes="(min-width: 768px) 33vw, 100vw" className="object-cover transition duration-700 group-hover:scale-105" />
              </div>
              <p className="mt-4 text-[12.5px] text-muted">{p.readMins} min read</p>
              <h3 className="h3 mt-1 group-hover:underline group-hover:underline-offset-4">{p.title}</h3>
              <p className="mt-1.5 text-[14px] text-muted">{p.dek}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* -------------------------------- letters -------------------------------- */}
      <section className="mx-auto mt-24 max-w-[1320px] px-4 md:px-8">
        <div className="grain relative overflow-hidden rounded-[28px] bg-[#EFE6D6] px-6 py-14 text-center md:py-20">
          <p className="hand text-[34px] leading-none text-indigo md:text-[44px]">Letters from the workshop</p>
          <p className="mx-auto mt-4 max-w-md text-[15px] text-ink/75">
            New batches go to the list first — they&apos;re small (the Chanderi run is only thirty). No more than two letters a month.
          </p>
          <div className="mt-7 flex justify-center">
            <NewsletterForm source="home" />
          </div>
        </div>
      </section>
    </>
  );
}
