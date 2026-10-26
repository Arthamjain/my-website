"use client";

import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";
import { motion, useScroll, useSpring, useTransform, type MotionValue } from "framer-motion";

type Chapter = {
  n: string;
  title: string;
  paper: string;
  ink: string;
  bg: string;
  photo: string;
  caption: string;
  lines: string[];
};

const CHAPTERS: Chapter[] = [
  {
    n: "i",
    title: "The paper",
    paper: "#F4EEE2",
    ink: "#23315a",
    bg: "#EFE7DA",
    photo: "/images/fountain-script.jpg",
    caption: "fountain pen, no feathering",
    lines: ["120gsm cotton rag.", "Made from textile offcuts,", "not trees.", "Ink sits on top, dries clean,", "and never ghosts through."],
  },
  {
    n: "ii",
    title: "The spine",
    paper: "#F3E6CC",
    ink: "#5b3d12",
    bg: "#E9D9B8",
    photo: "/images/renders/rod.webp",
    caption: "solid brass, turned in Moradabad",
    lines: ["One rod of solid brass", "holds it all together.", "Lift it — the pages slide out.", "Drop it — it clicks home.", "It darkens where you hold it."],
  },
  {
    n: "iii",
    title: "The cloth",
    paper: "#2E3E63",
    ink: "#F1E9DA",
    bg: "#1F2A44",
    photo: "/images/fabric/tex-dabu.jpg",
    caption: "indigo dabu, Bagru",
    lines: ["Every cover is printed", "or woven by hand —", "16 to 32 hours each.", "No two land quite the same.", "That wobble is a person."],
  },
  {
    n: "iv",
    title: "The moods",
    paper: "#F2CF94",
    ink: "#6a2412",
    bg: "#E8B66A",
    photo: "/images/fabric/tex-mashru.jpg",
    caption: "marigold mashru, Patan",
    lines: ["Indigo when you need to focus.", "Marigold when you need a push.", "Raw tussar to slow down.", "Change the cover", "when your week changes."],
  },
  {
    n: "v",
    title: "The refill",
    paper: "#E9E0D0",
    ink: "#2d4236",
    bg: "#D9CDB8",
    photo: "/images/open-blank.jpg",
    caption: "192 fresh pages",
    lines: ["When the last page is full,", "keep the cover.", "A new block is ₹450", "and thirty seconds.", "This one could last a decade."],
  },
];

const N = CHAPTERS.length;
// Scroll budget: one share to open the cover, one per chapter, a little tail.
const OPEN_END = 0.1;
const span = (1 - OPEN_END - 0.06) / N;
const chapterStart = (k: number) => OPEN_END + k * span;

const PAPER_DOTS = "radial-gradient(circle, rgba(60,50,40,.16) 1px, transparent 1.3px)";

function Line({ w, j, m, children }: { w: MotionValue<number>; j: number; m: number; children: string }) {
  const clip = useTransform(w, (v) => {
    const t = Math.min(1, Math.max(0, v * m - j));
    return `inset(-20% ${100 - t * 100}% -20% 0)`;
  });
  return (
    <motion.span style={{ clipPath: clip }} className="block whitespace-nowrap">
      {children}
    </motion.span>
  );
}

function RightPage({ c, k, progress }: { c: Chapter; k: number; progress: MotionValue<number> }) {
  const s = chapterStart(k);
  const w = useTransform(progress, [s + span * 0.18, s + span * 0.85], [0, 1]);
  return (
    <div className="relative h-full w-full overflow-hidden rounded-r-[6px] p-[8%]" style={{ background: c.paper, color: c.ink }}>
      <div className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: PAPER_DOTS, backgroundSize: "clamp(12px,1.6vw,18px) clamp(12px,1.6vw,18px)" }} />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[14%] bg-gradient-to-r from-black/15 to-transparent" />
      <div className="relative">
        <p className="hand text-[clamp(15px,1.5vw,20px)] opacity-70 md:hidden">
          {c.n}. {c.title}
        </p>
        <div className="hand mt-[6%] space-y-[0.35em] text-[clamp(19px,2.15vw,30px)] leading-[1.25]">
          {c.lines.map((l, j) => (
            <Line key={j} w={w} j={j} m={c.lines.length}>
              {l}
            </Line>
          ))}
        </div>
      </div>
      <p className="absolute bottom-[5%] right-[8%] text-[11px] opacity-50">{k * 2 + 2}</p>
    </div>
  );
}

function LeftPage({ c, k }: { c: Chapter; k: number }) {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-l-[6px] p-[8%]" style={{ background: c.paper, color: c.ink }}>
      <div className="pointer-events-none absolute inset-0 opacity-70" style={{ backgroundImage: PAPER_DOTS, backgroundSize: "clamp(12px,1.6vw,18px) clamp(12px,1.6vw,18px)" }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-[14%] bg-gradient-to-l from-black/15 to-transparent" />
      <div className="relative flex h-full flex-col">
        <p className="font-serif text-[clamp(14px,1.3vw,18px)] italic opacity-70">Chapter {c.n}</p>
        <p className="font-serif text-[clamp(28px,3.4vw,52px)] leading-none">{c.title}</p>
        <figure className="mt-auto w-[78%] rotate-[-2.5deg] self-center bg-white p-[4%] pb-[3%] shadow-[0_8px_20px_rgba(0,0,0,0.18)]">
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-[#efe9df]">
            <Image src={c.photo} alt="" fill sizes="30vw" className={c.photo.includes("/renders/") ? "object-contain p-2" : "object-cover"} />
          </div>
          <figcaption className="hand mt-[3%] text-center text-[clamp(13px,1.2vw,17px)] text-[#3b3530]">{c.caption}</figcaption>
          <span className="absolute -top-3 left-1/2 h-6 w-16 -translate-x-1/2 rotate-[3deg] bg-[#e9dcc0]/80" />
        </figure>
      </div>
      <p className="absolute bottom-[5%] left-[8%] text-[11px] opacity-50">{k * 2 + 1}</p>
    </div>
  );
}

function Cover() {
  return (
    <div className="relative h-full w-full overflow-hidden rounded-r-[8px] rounded-l-[3px] shadow-[inset_0_0_40px_rgba(0,0,0,0.35)]">
      <Image src="/images/fabric/tex-dabu.jpg" alt="Indigo dabu cover" fill sizes="45vw" className="object-cover" priority />
      <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/30" />
      <div className="absolute bottom-[7%] right-[8%] rounded-sm bg-[#d8b46a] px-3 py-1 font-serif text-[clamp(12px,1.2vw,16px)] tracking-[0.2em] text-[#3a2a10] shadow">KĀYA</div>
    </div>
  );
}

function Leaf({
  i,
  progress,
  front,
  back,
}: {
  i: number;
  progress: MotionValue<number>;
  front: React.ReactNode;
  back: React.ReactNode;
}) {
  // Leaf 0 is the cover; leaf i>0 turns at the end of chapter i-1.
  const start = i === 0 ? 0.02 : chapterStart(i - 1) + span * 0.9;
  const end = i === 0 ? OPEN_END : chapterStart(i) + span * 0.08;
  const rotate = useTransform(progress, [start, end], [0, -180], { clamp: true });
  const z = useTransform(rotate, (r) => (r < -90 ? 10 + i : 100 - i));
  return (
    <motion.div className="absolute inset-0 [transform-style:preserve-3d]" style={{ rotateY: rotate, zIndex: z, transformOrigin: "left center" }}>
      <div className="absolute inset-0 [backface-visibility:hidden]">{front}</div>
      <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">{back}</div>
    </motion.div>
  );
}

export default function StoryBook() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 30, mass: 0.4 });

  // Each chapter holds its own colour; the change happens while the page turns.
  const stops = [0, OPEN_END * 0.5, ...CHAPTERS.flatMap((_, k) => [chapterStart(k) + span * (k ? 0.02 : 0), chapterStart(k) + span * 0.9]), 1];
  const bg = useTransform(progress, stops, ["#FAF7F2", "#FAF7F2", ...CHAPTERS.flatMap((c) => [c.bg, c.bg]), CHAPTERS[N - 1].bg]);
  const darkStops = useTransform(progress, (v) => {
    const k = Math.floor((v - OPEN_END) / span);
    return k === 2 ? "#F1E9DA" : "#1C1917";
  });
  // Closed: book sits centred on its own width; open: the spine moves to centre.
  const shift = useTransform(progress, [0.02, OPEN_END], ["0%", "50%"]);
  const tilt = useTransform(progress, [0, OPEN_END], [14, 4]);
  const hint = useTransform(progress, [0, 0.04], [1, 0]);
  const outro = useTransform(progress, [0.93, 0.97], [0, 1]);
  const lift = useTransform(progress, [0.92, 0.98], ["0vh", "-7vh"]);

  return (
    <motion.section ref={ref} style={{ background: bg }} className="relative h-[700vh]">
      <div className="sticky top-0 flex h-[100svh] flex-col items-center justify-center overflow-hidden">
        <motion.p style={{ opacity: hint, color: darkStops }} className="absolute top-[9%] text-center">
          <span className="eyebrow block">The story of a KĀYA</span>
          <span className="hand mt-2 block text-[34px]">scroll to open ↓</span>
        </motion.p>

        <div className="[perspective:2200px]">
          <motion.div style={{ rotateX: tilt, y: lift }} className="relative [transform-style:preserve-3d]">
            {/* desktop: spine moves to centre as it opens; mobile: right page stays centred */}
            <motion.div
              style={{ x: shift }}
              className="relative hidden h-[min(60vh,calc(34vw*1.42))] w-[min(calc(60vh/1.42),34vw)] [transform-style:preserve-3d] md:block"
            >
              <Pages progress={progress} />
            </motion.div>
            <div className="relative h-[min(58vh,calc(78vw*1.42))] w-[min(calc(58vh/1.42),78vw)] [transform-style:preserve-3d] md:hidden">
              <Pages progress={progress} />
            </div>
          </motion.div>
        </div>

        <motion.div style={{ opacity: outro }} className="pointer-events-auto absolute bottom-[4%] flex flex-col items-center gap-2 text-center">
          <p className="hand text-[34px] text-ink">Your turn.</p>
          <div className="flex gap-3">
            <Link href="/shop?category=journal" className="btn btn-primary">
              Choose your journal
            </Link>
            <Link href="/makers" className="btn btn-ghost bg-paper/60">
              Meet the makers
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.section>
  );
}

function Pages({ progress }: { progress: MotionValue<number> }) {
  return (
    <>
      {/* the page block under everything */}
      <div className="absolute inset-0 translate-x-[3px] translate-y-[3px] rounded-r-[6px] bg-[#e4dbcb] shadow-[0_30px_60px_rgba(30,20,10,0.25)]" />
      <div className="absolute inset-0">
        <RightPage c={CHAPTERS[N - 1]} k={N - 1} progress={progress} />
      </div>
      {/* leaves, top first */}
      {Array.from({ length: N }, (_, i) => (
        <Leaf
          key={i}
          i={i}
          progress={progress}
          front={i === 0 ? <Cover /> : <RightPage c={CHAPTERS[i - 1]} k={i - 1} progress={progress} />}
          back={<LeftPage c={CHAPTERS[i]} k={i} />}
        />
      ))}
      {/* brass spine rod */}
      <div className="absolute -left-[6px] -top-[14px] bottom-[-14px] z-[200] w-[10px] rounded-full bg-[linear-gradient(90deg,#7a5a22,#e9c983_40%,#b78c3e_70%,#6e4f1c)] shadow-[1px_0_4px_rgba(0,0,0,0.3)]" />
    </>
  );
}
