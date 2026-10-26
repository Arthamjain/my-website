import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { posts } from "@/data/posts";

export const metadata: Metadata = { title: "Journal" };

export default function JournalIndex() {
  const [lead, ...rest] = posts;
  return (
    <div className="mx-auto max-w-[1180px] px-4 py-12 md:px-8 md:py-16">
      <p className="eyebrow">The journal</p>
      <h1 className="h1 mt-2">Notes from the workshop</h1>
      <Link href={`/journal/${lead.slug}`} className="group mt-10 grid items-center gap-8 md:grid-cols-[1.3fr_1fr]">
        <div className="relative aspect-[16/10] overflow-hidden rounded-[24px]">
          <Image src={lead.image} alt="" fill priority sizes="(min-width: 768px) 60vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
        </div>
        <div>
          <p className="text-[13px] text-muted">{lead.readMins} min read</p>
          <h2 className="h1 mt-2 group-hover:underline group-hover:underline-offset-8">{lead.title}</h2>
          <p className="mt-3 text-[15.5px] text-muted">{lead.dek}</p>
        </div>
      </Link>
      <div className="mt-16 grid gap-10 md:grid-cols-2">
        {rest.map((p) => (
          <Link key={p.slug} href={`/journal/${p.slug}`} className="group">
            <div className="relative aspect-[16/10] overflow-hidden rounded-[20px]">
              <Image src={p.image} alt="" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover transition duration-700 group-hover:scale-[1.03]" />
            </div>
            <p className="mt-4 text-[13px] text-muted">{p.readMins} min read</p>
            <h2 className="h2 mt-1 group-hover:underline group-hover:underline-offset-4">{p.title}</h2>
            <p className="mt-2 text-[15px] text-muted">{p.dek}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
