import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import StoryBook from "./StoryBook";

export const metadata: Metadata = {
  title: "The story",
  description: "Open a KĀYA journal page by page: the cotton rag paper, the solid brass spine, the hand-loomed cloth and the refill.",
};

export default function StoryPage() {
  return (
    <>
      <StoryBook />
      <section className="mx-auto grid max-w-[1180px] items-center gap-12 px-4 pt-24 md:grid-cols-2 md:px-8">
        <div className="relative aspect-[4/5] overflow-hidden rounded-[24px]">
          <Image src="/images/reader-window.jpg" alt="A woman reading by a window" fill sizes="(min-width: 768px) 50vw, 100vw" className="object-cover" />
        </div>
        <div>
          <p className="eyebrow">Why we started</p>
          <h2 className="h1 mt-3">We kept buying beautiful notebooks and throwing them away.</h2>
          <div className="prose-kaya">
            <p>
              Every good notebook we owned ended the same way: full, slightly battered, and then in a drawer. The cover was the part we loved, and it was the
              part that got thrown out.
            </p>
            <p>
              So we built one where the cover stays and the paper changes — and then went looking for cloth worth keeping. That search took us to block-printers,
              spinners and weavers in five states, each doing something that machines still can&apos;t quite copy.
            </p>
            <p>KĀYA is the result: a journal you refill rather than replace, dressed in cloth that someone spent a day or more making.</p>
          </div>
          <Link href="/makers" className="btn btn-primary mt-8">
            Meet the makers
          </Link>
        </div>
      </section>
    </>
  );
}
