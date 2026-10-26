import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { posts } from "@/data/posts";

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/journal/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const p = posts.find((x) => x.slug === slug);
  return p ? { title: p.title, description: p.dek } : { title: "Not found" };
}

export default async function PostPage({ params }: PageProps<"/journal/[slug]">) {
  const { slug } = await params;
  const post = posts.find((p) => p.slug === slug);
  if (!post) notFound();
  const more = posts.filter((p) => p.slug !== slug).slice(0, 2);
  return (
    <article className="pb-10 pt-10 md:pt-16">
      <header className="mx-auto max-w-[760px] px-4 text-center">
        <Link href="/journal" className="eyebrow hover:text-ink">
          ← Journal
        </Link>
        <h1 className="h-display mt-5 text-[clamp(2.4rem,5vw,4rem)]">{post.title}</h1>
        <p className="mt-4 font-serif text-[22px] italic text-ink/70">{post.dek}</p>
        <p className="mt-4 text-[13px] text-muted">
          {new Date(post.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })} · {post.readMins} min read
        </p>
      </header>
      <div className="relative mx-auto mt-10 aspect-[16/9] max-w-[1100px] overflow-hidden md:rounded-[28px]">
        <Image src={post.image} alt="" fill priority sizes="1100px" className="object-cover" />
      </div>
      <div className="prose-kaya mx-auto max-w-[680px] px-4 text-[17px]">
        {post.body.map((p, i) => (
          <p key={i} className={i === 0 ? "first-letter:float-left first-letter:mr-2 first-letter:font-serif first-letter:text-[64px] first-letter:leading-[0.8]" : ""}>
            {p}
          </p>
        ))}
      </div>
      <div className="mx-auto mt-16 max-w-[680px] px-4">
        <Link href="/shop" className="btn btn-primary">
          See the journals
        </Link>
      </div>
      <aside className="mx-auto mt-20 max-w-[1100px] border-t border-line px-4 pt-10">
        <p className="eyebrow">Read next</p>
        <div className="mt-6 grid gap-8 md:grid-cols-2">
          {more.map((p) => (
            <Link key={p.slug} href={`/journal/${p.slug}`} className="group flex gap-5">
              <div className="relative h-28 w-36 shrink-0 overflow-hidden rounded-xl">
                <Image src={p.image} alt="" fill sizes="144px" className="object-cover" />
              </div>
              <div>
                <h3 className="h3 group-hover:underline">{p.title}</h3>
                <p className="mt-1 text-[14px] text-muted">{p.dek}</p>
              </div>
            </Link>
          ))}
        </div>
      </aside>
    </article>
  );
}
