import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import ProductCard from "@/components/store/ProductCard";
import SortSelect from "@/components/store/SortSelect";
import { CATEGORIES, listProducts, MOODS } from "@/lib/catalog";
import { cn } from "@/lib/utils";

export const metadata: Metadata = { title: "Shop" };

export default async function Shop({ searchParams }: PageProps<"/shop">) {
  const sp = await searchParams;
  const category = typeof sp.category === "string" ? sp.category : "";
  const mood = typeof sp.mood === "string" ? sp.mood : "";
  const sort = typeof sp.sort === "string" ? sp.sort : "";
  const products = await listProducts({ category: category || undefined, mood: mood || undefined, sort });
  const cat = CATEGORIES.find((c) => c.id === category);

  const href = (next: Record<string, string>) => {
    const p = new URLSearchParams({ ...(category && { category }), ...(mood && { mood }), ...(sort && { sort }), ...next });
    for (const [k, v] of [...p]) if (!v) p.delete(k);
    const q = p.toString();
    return `/shop${q ? `?${q}` : ""}`;
  };

  return (
    <div className="mx-auto max-w-[1320px] px-4 pb-10 pt-10 md:px-8 md:pt-14">
      <nav className="text-[12.5px] text-muted" aria-label="Breadcrumb">
        <Link href="/">Home</Link> / <span className="text-ink">{cat?.label ?? "Shop all"}</span>
      </nav>
      <h1 className="h1 mt-3">{cat?.label ?? "Shop all"}</h1>
      <p className="mt-2 max-w-xl text-[15px] text-muted">{cat?.blurb ?? "Journals, covers, sets and refills — everything we make, in small batches."}</p>

      <div className="sticky top-16 z-20 -mx-4 mt-8 border-y border-line bg-paper/95 px-4 py-3 backdrop-blur md:top-[72px] md:mx-0 md:px-0">
        <div className="flex flex-wrap items-center gap-2">
          <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1">
            <Link href={href({ category: "" })} className={cn("shrink-0 rounded-full border px-4 py-2 text-[13.5px]", !category ? "border-ink bg-ink text-paper" : "border-line hover:border-ink")}>
              All
            </Link>
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                href={href({ category: c.id })}
                className={cn("shrink-0 rounded-full border px-4 py-2 text-[13.5px]", category === c.id ? "border-ink bg-ink text-paper" : "border-line hover:border-ink")}
              >
                {c.label}
              </Link>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-4">
            <span className="hidden text-[13px] text-muted sm:inline">{products.length} items</span>
            <Suspense>
              <SortSelect value={sort} />
            </Suspense>
          </div>
        </div>
        {(category === "" || category === "journal" || category === "cover") && (
          <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto">
            <span className="shrink-0 self-center text-[12.5px] text-muted">Mood</span>
            {MOODS.map((m) => (
              <Link
                key={m.id}
                href={href({ mood: mood === m.id ? "" : m.id })}
                className={cn("flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-[13px]", mood === m.id ? "border-ink bg-white" : "border-transparent hover:border-line")}
              >
                <span className="h-3 w-3 rounded-full" style={{ background: m.color }} />
                {m.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <div className="py-24 text-center">
          <p className="hand text-3xl text-muted">Nothing matches that — yet.</p>
          <Link href="/shop" className="btn btn-ghost mt-6">
            Clear filters
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 lg:grid-cols-4">
          {products.map((p, i) => (
            <ProductCard key={p.id} p={p} priority={i < 4} />
          ))}
        </div>
      )}
    </div>
  );
}
