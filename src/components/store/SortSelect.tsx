"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

export default function SortSelect({ value }: { value: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  return (
    <label className="flex items-center gap-2 text-[13.5px]">
      <span className="text-muted">Sort</span>
      <select
        value={value}
        onChange={(e) => {
          const p = new URLSearchParams(params);
          if (e.target.value) p.set("sort", e.target.value);
          else p.delete("sort");
          router.push(`${pathname}?${p}`, { scroll: false });
        }}
        className="rounded-full border border-line bg-white px-3 py-2"
      >
        <option value="">Featured</option>
        <option value="new">Newest</option>
        <option value="price-asc">Price: low to high</option>
        <option value="price-desc">Price: high to low</option>
      </select>
    </label>
  );
}
