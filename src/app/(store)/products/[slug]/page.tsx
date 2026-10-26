import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import Gallery from "@/components/store/Gallery";
import BuyBox from "@/components/store/BuyBox";
import Accordion from "@/components/store/Accordion";
import ProductCard from "@/components/store/ProductCard";
import ReviewForm, { Stars } from "@/components/store/ReviewForm";
import { CATEGORIES, getProductBySlug, getRelated, getReviews, parseList, variantPrice } from "@/lib/catalog";
import { fabricForSlug } from "@/lib/fabrics3d";
import { getSettings } from "@/lib/settings";
import { formatINR } from "@/lib/utils";

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) return { title: "Not found" };
  return { title: p.title, description: `${p.subtitle} ${p.description}`.slice(0, 160), openGraph: { images: p.images[0]?.url ? [p.images[0].url] : [] } };
}

export default async function ProductPage({ params }: PageProps<"/products/[slug]">) {
  const { slug } = await params;
  const p = await getProductBySlug(slug);
  if (!p) notFound();
  const [related, reviews, settings] = await Promise.all([getRelated(p), getReviews(p.id), getSettings()]);
  const fabric = p.category === "journal" || p.category === "cover" ? fabricForSlug(p.slug) : null;
  const details = parseList(p.details);
  const care = parseList(p.care);
  const cat = CATEGORIES.find((c) => c.id === p.category);
  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;
  const hasFabricPhoto = p.texture && !p.texture.includes("paper");

  return (
    <div className="pb-24 md:pb-0">
      <div className="mx-auto max-w-[1320px] px-4 pt-6 md:px-8 md:pt-10">
        <nav className="text-[12.5px] text-muted" aria-label="Breadcrumb">
          <Link href="/">Home</Link> / <Link href={`/shop?category=${p.category}`}>{cat?.label ?? "Shop"}</Link> / <span className="text-ink">{p.title}</span>
        </nav>

        <div className="mt-5 grid gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-16">
          <div className="min-w-0 lg:sticky lg:top-24 lg:self-start">
            <Gallery images={p.images.map((i) => ({ url: i.url, alt: i.alt }))} title={p.title} fabric={fabric} />
          </div>

          <div className="min-w-0 lg:pt-2">
            {p.region && <p className="eyebrow">{p.region}</p>}
            <h1 className="h1 mt-2">{p.title}</h1>
            <p className="mt-2 font-serif text-[21px] italic leading-snug text-ink/75">{p.subtitle}</p>
            {reviews.length > 0 && (
              <a href="#reviews" className="mt-3 inline-flex items-center gap-2 text-[13px] text-muted">
                <Stars value={avg} /> {avg.toFixed(1)} · {reviews.length} review{reviews.length > 1 ? "s" : ""}
              </a>
            )}
            <div className="mt-6">
              <BuyBox
                product={{ id: p.id, slug: p.slug, title: p.title, image: p.images[0]?.url ?? "", compare_at: p.compare_at, batch: p.batch }}
                variants={p.variants.map((v) => ({ id: v.id, title: v.title, format: v.format, ruling: v.ruling, price: variantPrice(p, v), stock: v.stock }))}
                freeShipping={settings.free_shipping_threshold}
              />
            </div>

            <p className="mt-8 text-[15px] leading-relaxed text-ink/80">{p.description}</p>

            <div className="mt-8">
              <Accordion
                items={[
                  { title: "What you get", content: <ul className="list-disc space-y-1 pl-5">{details.map((d) => <li key={d}>{d}</li>)}</ul> },
                  { title: "Caring for the cloth", content: <ul className="list-disc space-y-1 pl-5">{care.map((d) => <li key={d}>{d}</li>)}</ul> },
                  {
                    title: "Shipping & returns",
                    content: (
                      <>
                        <p>
                          Orders leave our studio within 24 hours on working days. Standard delivery takes 3–6 days across India and is free over{" "}
                          {formatINR(settings.free_shipping_threshold)}; express is {formatINR(settings.express_shipping)}.
                        </p>
                        <p className="mt-2">
                          Unused items can be returned within 7 days of delivery. Covers can be exchanged for another cloth.{" "}
                          <Link href="/help#returns" className="underline">
                            Full policy
                          </Link>
                        </p>
                      </>
                    ),
                  },
                ]}
              />
            </div>
          </div>
        </div>
      </div>

      {/* cloth story */}
      {p.story && (
        <section className="mx-auto mt-24 max-w-[1320px] px-4 md:px-8">
          <div className="grid overflow-hidden rounded-[28px] bg-linen md:grid-cols-2">
            {hasFabricPhoto ? (
              <div className="relative min-h-[320px]">
                <Image src={p.texture} alt={`The ${p.title} cloth up close`} fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
              </div>
            ) : (
              <div className="relative min-h-[320px]">
                <Image src="/images/open-blank.jpg" alt="" fill sizes="50vw" className="object-cover" />
              </div>
            )}
            <div className="p-8 md:p-14">
              <p className="eyebrow">{p.maker || "The making"}</p>
              <h2 className="h2 mt-3">How it&apos;s made</h2>
              <p className="mt-5 text-[15px] leading-relaxed text-ink/80">{p.story}</p>
              {p.loom_hours > 0 && (
                <dl className="mt-8 grid grid-cols-3 gap-4 border-t border-ink/10 pt-6 text-[13px]">
                  <div>
                    <dt className="text-muted">Hand hours</dt>
                    <dd className="mt-1 font-serif text-2xl">{p.loom_hours}</dd>
                  </div>
                  <div>
                    <dt className="text-muted">Region</dt>
                    <dd className="mt-1 font-medium">{p.region}</dd>
                  </div>
                  {p.batch && (
                    <div>
                      <dt className="text-muted">Run</dt>
                      <dd className="mt-1 font-medium">{p.batch}</dd>
                    </div>
                  )}
                </dl>
              )}
            </div>
          </div>
        </section>
      )}

      {/* reviews */}
      <section id="reviews" className="mx-auto mt-24 max-w-[1320px] scroll-mt-28 px-4 md:px-8">
        <div className="flex flex-col justify-between gap-6 border-b border-line pb-6 md:flex-row md:items-end">
          <div>
            <h2 className="h2">Reviews</h2>
            {reviews.length > 0 ? (
              <p className="mt-2 flex items-center gap-2 text-[14px] text-muted">
                <Stars value={avg} size={16} /> {avg.toFixed(1)} out of 5 · {reviews.length} review{reviews.length > 1 ? "s" : ""}
              </p>
            ) : (
              <p className="mt-2 text-[14px] text-muted">No reviews yet. If you own one, we&apos;d love to hear how it&apos;s holding up.</p>
            )}
          </div>
          <ReviewForm productId={p.id} />
        </div>
        <ul className="divide-y divide-line">
          {reviews.map((r) => (
            <li key={r.id} className="grid gap-2 py-6 md:grid-cols-[220px_1fr]">
              <div className="text-[13.5px]">
                <p className="font-medium">{r.name}</p>
                <p className="text-muted">
                  {r.location}
                  {r.verified ? " · Verified buyer" : ""}
                </p>
              </div>
              <div>
                <Stars value={r.rating} />
                {r.title && <p className="mt-2 font-medium">{r.title}</p>}
                <p className="mt-1 text-[14.5px] leading-relaxed text-ink/80">{r.body}</p>
                <p className="mt-2 text-[12px] text-muted">{new Date(r.created_at + "Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* related */}
      <section className="mx-auto mt-20 max-w-[1320px] px-4 md:px-8">
        <h2 className="h2">Pairs well with</h2>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {related.map((r) => (
            <ProductCard key={r.id} p={r} />
          ))}
        </div>
      </section>
    </div>
  );
}
