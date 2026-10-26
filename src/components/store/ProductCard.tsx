import Image from "next/image";
import Link from "next/link";
import { formatINR } from "@/lib/utils";
import type { ProductCard as Card } from "@/lib/catalog";

export default function ProductCard({ p, priority }: { p: Card; priority?: boolean }) {
  const low = p.stock > 0 && p.stock <= 8;
  const sale = p.compare_at && p.compare_at > p.price;
  return (
    <Link href={`/products/${p.slug}`} className="group block">
      <div className="card-photo relative aspect-[4/5] overflow-hidden rounded-xl">
        {p.image && (
          <Image
            src={p.image}
            alt={p.title}
            fill
            priority={priority}
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className="object-contain p-4 transition duration-700 group-hover:scale-[1.03] group-hover:opacity-0"
          />
        )}
        {p.image2 && (
          <Image
            src={p.image2}
            alt=""
            fill
            sizes="(min-width: 1024px) 25vw, (min-width: 640px) 33vw, 50vw"
            className={`scale-[1.03] opacity-0 transition duration-700 group-hover:scale-100 group-hover:opacity-100 ${p.image2.includes("/renders/") ? "object-contain p-4" : "object-cover"}`}
          />
        )}
        <div className="absolute left-3 top-3 flex flex-col items-start gap-1.5">
          {p.stock === 0 && <span className="rounded-full bg-ink px-2.5 py-1 text-[11px] text-paper">Sold out</span>}
          {sale && <span className="rounded-full bg-clay px-2.5 py-1 text-[11px] text-white">Save {formatINR(p.compare_at! - p.price)}</span>}
          {low && <span className="rounded-full bg-paper/90 px-2.5 py-1 text-[11px] text-ink">Only {p.stock} left</span>}
        </div>
      </div>
      <div className="mt-3.5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[15px] font-medium leading-snug">{p.title}</p>
          <p className="mt-0.5 line-clamp-1 text-[13px] text-muted">{p.subtitle}</p>
        </div>
        <span className="mt-1 h-3.5 w-3.5 shrink-0 rounded-full ring-1 ring-black/10" style={{ background: p.color }} aria-hidden />
      </div>
      <p className="mt-1.5 text-[14.5px] tabular-nums">
        {sale && <span className="mr-2 text-muted line-through">{formatINR(p.compare_at!)}</span>}
        {formatINR(p.price)}
        {p.rating && <span className="ml-2 text-[12.5px] text-muted">★ {p.rating} ({p.reviews})</span>}
      </p>
    </Link>
  );
}
