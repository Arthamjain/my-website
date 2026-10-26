import type { Metadata } from "next";
import Link from "next/link";
import ProductCard from "@/components/store/ProductCard";
import { listProducts } from "@/lib/catalog";

export const metadata: Metadata = { title: "Search" };

export default async function SearchPage({ searchParams }: PageProps<"/search">) {
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim().slice(0, 80) : "";
  const results = q ? await listProducts({ q }) : [];
  return (
    <div className="mx-auto max-w-[1320px] px-4 pt-10 md:px-8 md:pt-14">
      <form className="mx-auto max-w-2xl" action="/search">
        <label htmlFor="q" className="h1 block text-center">
          Search
        </label>
        <input id="q" name="q" defaultValue={q} autoFocus placeholder="Try ‘indigo’, ‘refill’ or ‘gift’" className="input mt-6 rounded-full px-6 py-4 text-[16px]" />
      </form>
      {q && (
        <p className="mt-10 text-[14px] text-muted">
          {results.length} result{results.length === 1 ? "" : "s"} for &ldquo;{q}&rdquo;
        </p>
      )}
      {q && results.length === 0 && (
        <p className="mt-4 text-[15px]">
          Nothing found. <Link href="/shop" className="underline">Browse everything</Link> instead.
        </p>
      )}
      <div className="mt-6 grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
        {results.map((p) => (
          <ProductCard key={p.id} p={p} />
        ))}
      </div>
    </div>
  );
}
