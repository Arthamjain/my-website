import type { Client } from "@libsql/client";

type SeedProduct = {
  slug: string;
  title: string;
  subtitle: string;
  category: "journal" | "cover" | "set" | "refill" | "accessory";
  description: string;
  story: string;
  details: string[];
  care: string[];
  price: number;
  compare_at?: number;
  featured?: boolean;
  mood: string;
  color: string;
  color2: string;
  texture: string;
  maker: string;
  region: string;
  loom_hours: number;
  batch: string;
  tags: string;
  images: [string, string][];
  variants: { title: string; format: string; ruling: string; sku: string; price?: number; stock: number }[];
};

const RULINGS = [
  ["Dot grid", "dot"],
  ["Plain", "plain"],
  ["Lined", "lined"],
] as const;

const journalVariants = (code: string, price: number) =>
  [
    ["A5", "a5", 0],
    ["Pocket", "pocket", -450],
  ].flatMap(([f, fc, delta]) =>
    RULINGS.map(([r, rc], i) => ({
      title: `${f} · ${r}`,
      format: f as string,
      ruling: r,
      sku: `KY-J-${code}-${fc}-${rc}`.toUpperCase(),
      price: price + (delta as number),
      stock: [14, 9, 6, 11, 5, 3][i + (fc === "pocket" ? 3 : 0)],
    })),
  );

const coverVariants = (code: string, price: number) => [
  { title: "A5", format: "A5", ruling: "", sku: `KY-C-${code}-A5`, price, stock: 18 },
  { title: "Pocket", format: "Pocket", ruling: "", sku: `KY-C-${code}-PK`, price: price - 250, stock: 10 },
];

const FABRICS = [
  {
    code: "dabu",
    name: "Indigo Dabu",
    mood: "focus",
    color: "#263859",
    color2: "#D9CDB4",
    region: "Bagru, Rajasthan",
    maker: "Block-printers of Bagru",
    hours: 18,
    batch: "Batch 04 of 50",
    jPrice: 2450,
    cPrice: 950,
    line: "For the days you need to think in a straight line.",
    description:
      "Mud-resist printed by hand, then dipped in natural indigo vats until the blue goes deep and quiet. It is the cover we reach for when there is one hard thing to finish and nothing else should get a look in.",
    story:
      "Dabu is older than any of us. A paste of black clay, lime and wheat husk is stamped onto cotton with carved wooden blocks, dusted with sawdust and left to dry in the sun. When the cloth goes into the indigo vat, the clay holds back the dye, so each motif keeps a soft, cracked edge. No two blocks land quite the same way twice — that wobble is how you know a person made it.",
    care: [
      "Brush off dust with a soft, dry clothes brush.",
      "Spot-clean with cold water only. Natural indigo softens with time; that is intended.",
      "Keep out of strong sun for long stretches.",
    ],
  },
  {
    code: "mashru",
    name: "Marigold Mashru",
    mood: "spark",
    color: "#C85A32",
    color2: "#E2A13B",
    region: "Patan, Gujarat",
    maker: "Mashru weavers of Patan",
    hours: 24,
    batch: "Batch 07 of 40",
    jPrice: 2850,
    cPrice: 1250,
    line: "For first drafts, loud ideas and Sunday plans.",
    description:
      "Mashru means ‘permitted’ — a satin weave with a silk face and a cotton back. Ours is tie-dyed in marigold and madder before it ever reaches the loom, so the stripes blur slightly where the threads meet. It catches the light every time you pick it up.",
    story:
      "Mashru was woven so silk could be worn against cotton. The weavers of Patan tie and dye the warp threads by hand before setting up the loom, which is why the edges of each stripe feather instead of stopping sharp. It is a slow cloth for a fast mind.",
    care: [
      "Silk face: store away from damp and wipe with a dry cloth.",
      "Never wring. If it creases, press flat under a cotton cloth.",
      "Colour may mellow over years of use — that is the patina.",
    ],
  },
  {
    code: "tussar",
    name: "Raw Tussar",
    mood: "rest",
    color: "#D8CBB8",
    color2: "#B9A88F",
    region: "Bhagalpur, Bihar",
    maker: "Hand-spinners of Bhagalpur",
    hours: 16,
    batch: "Batch 02 of 60",
    jPrice: 2250,
    cPrice: 850,
    line: "Nothing to decode. Just the page.",
    description:
      "Undyed tussar silk spun with khadi cotton, left exactly the colour it came off the charkha. You will feel small slubs under your thumb — those are the spinner’s signature, not flaws. Our calmest cover, and the one people tell us they never take off.",
    story:
      "Tussar comes from wild silkworms that feed on forest trees, so the thread is uneven, warm and slightly golden. In Bhagalpur it is hand-spun and woven with khadi cotton without any dye at all. What you see is what the moth and the spinner made.",
    care: [
      "Slubs are hand-spun marks. Please never trim them.",
      "Brush gently along the weave to lift dust.",
      "Air in shade. Raw silk deepens in tone over time.",
    ],
  },
  {
    code: "chanderi",
    name: "Forest Chanderi",
    mood: "authority",
    color: "#2D4236",
    color2: "#C5A059",
    region: "Chanderi, Madhya Pradesh",
    maker: "Pit-loom weavers of Chanderi",
    hours: 32,
    batch: "Batch 03 of 30",
    jPrice: 3150,
    cPrice: 1450,
    line: "For meetings where you would rather listen first.",
    description:
      "Deep forest green, with small zari buttis woven in one by one on a pit loom. It reads serious without being stiff. The gold is real metallic thread, so it shifts from bright to bronze depending on the light in the room.",
    story:
      "Chanderi weavers work sitting in a pit below the loom, which keeps the cotton and silk threads cool and supple. Each small gold motif is added by hand with a separate shuttle — it is the slowest cover we make, and the smallest batch.",
    care: [
      "Zari is real metallic thread: keep away from perfume and moisture.",
      "Store in the muslin pouch to slow tarnish.",
      "Never iron directly over the motifs.",
    ],
  },
  {
    code: "jamdani",
    name: "Rose Jamdani",
    mood: "tender",
    color: "#C98CA7",
    color2: "#F2E8DC",
    region: "Nadia, West Bengal",
    maker: "Jamdani weavers of Nadia",
    hours: 28,
    batch: "Batch 05 of 45",
    jPrice: 2650,
    cPrice: 1100,
    line: "For late-night pages and unfinished poems.",
    description:
      "Soft rose with tiny woven dots that seem to float on the surface. Jamdani is a supplementary-weft technique — every motif is tucked in by hand, thread by thread, while the cloth is being woven. Gentle to look at, gentle to hold.",
    story:
      "Jamdani motifs are not printed or embroidered; they are woven in, one pass at a time, by weavers working from memory rather than paper patterns. It is light, slightly translucent and quietly decorative — the kind of cloth that rewards a second look.",
    care: [
      "Featherlight weave: handle by the edges and store flat.",
      "Spot-clean with diluted mild soap and cold water.",
      "Let it breathe — avoid sealed plastic.",
    ],
  },
];

const JOURNAL_DETAILS = [
  "Solid brass spine rod, hand-rubbed antique finish",
  "192 pages of 120gsm cotton rag paper, fountain-pen safe",
  "Smyth-sewn text block that lies completely flat",
  "Interchangeable fabric sleeve with inner pocket",
  "A5: 148 × 210 mm · Pocket: 105 × 148 mm",
  "Ships in a reusable muslin pouch",
];

const COVER_DETAILS = [
  "Fits every KĀYA journal of the same size",
  "Hand-loomed fabric bonded to a light board",
  "Swaps in under 30 seconds — lift the rod, slide, drop",
  "Inner pocket for receipts, tickets and pressed flowers",
];

export const CATALOG: SeedProduct[] = [
  ...FABRICS.map((f, i) => ({
    slug: `${f.code}-journal`,
    title: `${f.name} Journal`,
    subtitle: f.line,
    category: "journal" as const,
    description: f.description,
    story: f.story,
    details: JOURNAL_DETAILS,
    care: f.care,
    price: f.jPrice,
    featured: i < 4,
    mood: f.mood,
    color: f.color,
    color2: f.color2,
    texture: `/images/fabric/tex-${f.code}.jpg`,
    maker: f.maker,
    region: f.region,
    loom_hours: f.hours,
    batch: f.batch,
    tags: `${f.mood}, journal, ${f.code}`,
    images: [
      [`/images/renders/${f.code}-hero.webp`, `${f.name} journal, three-quarter view`],
      [`/images/renders/${f.code}-open.webp`, `${f.name} journal lying open on cotton rag pages`],
      [`/images/renders/${f.code}-front.webp`, `${f.name} journal, front cover`],
      [`/images/fabric/tex-${f.code}.jpg`, `Close-up of the ${f.name} fabric`],
    ] as [string, string][],
    variants: journalVariants(f.code.slice(0, 3), f.jPrice),
  })),
  ...FABRICS.map((f) => ({
    slug: `${f.code}-cover`,
    title: `${f.name} Cover`,
    subtitle: "Cover only — slides onto the journal you already own.",
    category: "cover" as const,
    description: `The ${f.name} sleeve on its own, for when you already have a KĀYA journal and want to change its mood. ${f.description.split(". ")[0]}.`,
    story: f.story,
    details: COVER_DETAILS,
    care: f.care,
    price: f.cPrice,
    mood: f.mood,
    color: f.color,
    color2: f.color2,
    texture: `/images/fabric/tex-${f.code}.jpg`,
    maker: f.maker,
    region: f.region,
    loom_hours: f.hours,
    batch: f.batch,
    tags: `${f.mood}, cover, ${f.code}`,
    images: [
      [`/images/renders/${f.code}-front.webp`, `${f.name} cover`],
      [`/images/fabric/tex-${f.code}.jpg`, `Close-up of the ${f.name} fabric`],
      [`/images/renders/${f.code}-hero.webp`, `${f.name} cover fitted on a journal`],
    ] as [string, string][],
    variants: coverVariants(f.code.slice(0, 3).toUpperCase(), f.cPrice),
  })),
  {
    slug: "mood-wardrobe-set",
    title: "The Mood Wardrobe",
    subtitle: "One journal, three covers: focus, spark and rest.",
    category: "set",
    description:
      "Our most-given set. A brass-spined journal dressed in Indigo Dabu, with Marigold Mashru and Raw Tussar covers to swap in when the week changes. Includes a free brass monogram plate.",
    story:
      "Most people do not feel one way all week. The Wardrobe was made for that: indigo for heads-down days, marigold for the ones that need a push, and raw tussar for the evenings you want to slow down.",
    details: [
      "1 A5 brass-spined journal (dot grid)",
      "3 covers: Indigo Dabu, Marigold Mashru, Raw Tussar",
      "Free brass monogram plate — add initials at checkout",
      "Gift-boxed with a handwritten card on request",
    ],
    care: ["See individual cover care cards inside the box."],
    price: 3850,
    compare_at: 4950,
    featured: true,
    mood: "set",
    color: "#7A4B2E",
    color2: "#E2A13B",
    texture: "/images/fabric/tex-mashru.jpg",
    maker: "Three clusters across India",
    region: "Rajasthan · Gujarat · Bihar",
    loom_hours: 58,
    batch: "",
    tags: "set, gift",
    images: [
      ["/images/renders/set-wardrobe.webp", "The Mood Wardrobe: one journal with three covers"],
      ["/images/renders/dabu-hero.webp", "Indigo Dabu journal"],
      ["/images/renders/mashru-front.webp", "Marigold Mashru cover"],
      ["/images/renders/tussar-front.webp", "Raw Tussar cover"],
    ],
    variants: [
      { title: "A5", format: "A5", ruling: "Dot grid", sku: "KY-S-WARD-A5", stock: 12 },
      { title: "Pocket", format: "Pocket", ruling: "Dot grid", sku: "KY-S-WARD-PK", price: 3350, stock: 6 },
    ],
  },
  {
    slug: "chromatic-archive-set",
    title: "The Complete Archive",
    subtitle: "All five covers, one journal, a teak desk cradle.",
    category: "set",
    description:
      "Every cover we make, with an A5 journal and a hand-turned teakwood cradle that holds it open on your desk. For collectors, studios, and very good presents.",
    story:
      "The Archive puts five regions and roughly 118 hours of hand-loom work in one box. We pack each cover with its own care card so you know who made it and how to look after it.",
    details: [
      "1 A5 brass-spined journal (dot grid)",
      "All 5 covers: Dabu, Mashru, Tussar, Chanderi, Jamdani",
      "Hand-turned teakwood desk cradle",
      "Free brass monogram plate",
    ],
    care: ["See individual cover care cards inside the box."],
    price: 5490,
    compare_at: 7600,
    featured: true,
    mood: "set",
    color: "#2D4236",
    color2: "#C5A059",
    texture: "/images/fabric/tex-chanderi.jpg",
    maker: "Five clusters across India",
    region: "Rajasthan · Gujarat · Bihar · MP · Bengal",
    loom_hours: 118,
    batch: "",
    tags: "set, gift",
    images: [
      ["/images/renders/set-archive.webp", "The Complete Archive: five covers and a journal"],
      ["/images/renders/chanderi-hero.webp", "Forest Chanderi journal"],
      ["/images/renders/jamdani-front.webp", "Rose Jamdani cover"],
    ],
    variants: [{ title: "A5", format: "A5", ruling: "Dot grid", sku: "KY-S-ARCH-A5", stock: 5 }],
  },
  {
    slug: "cotton-rag-refill",
    title: "Cotton Rag Refill",
    subtitle: "192 fresh pages. Your cover stays.",
    category: "refill",
    description:
      "A new Smyth-sewn text block of 120gsm cotton rag paper. Lift the brass rod, slide the old block out, drop the new one in. Fountain pens, brush pens and light watercolour all behave.",
    story:
      "Cotton rag paper is made from textile offcuts rather than wood pulp. It is soft, heavy and very forgiving — ink sits on top instead of feathering.",
    details: ["192 pages, 120gsm", "Deckled fore-edge", "Lays flat from page one", "Choose dot grid, plain or lined"],
    care: ["Keep dry. Store flat."],
    price: 450,
    mood: "refill",
    color: "#EFE7D8",
    color2: "#C5A059",
    texture: "/images/paper.jpg",
    maker: "KĀYA bindery, Jaipur",
    region: "Jaipur, Rajasthan",
    loom_hours: 0,
    batch: "",
    tags: "refill, paper",
    images: [
      ["/images/renders/refill.webp", "Cotton rag refill text block"],
      ["/images/open-blank.jpg", "An open notebook with blank pages"],
    ],
    variants: [
      ...RULINGS.map(([r, rc]) => ({ title: `A5 · ${r}`, format: "A5", ruling: r, sku: `KY-R-A5-${rc}`.toUpperCase(), stock: 40 })),
      ...RULINGS.map(([r, rc]) => ({ title: `Pocket · ${r}`, format: "Pocket", ruling: r, sku: `KY-R-PK-${rc}`.toUpperCase(), price: 350, stock: 30 })),
    ],
  },
  {
    slug: "brass-spine-rod",
    title: "Spare Brass Spine",
    subtitle: "Solid brass. Built to outlast the paper.",
    category: "accessory",
    description:
      "The rod that holds everything together, sold on its own as a spare or a replacement. Solid brass, turned and hand-rubbed to a soft antique finish that warms with handling.",
    story: "Every rod is turned in a small brass workshop in Moradabad and finished by hand.",
    details: ["Solid brass, not plated", "Antique hand-rubbed finish", "A5 and Pocket lengths"],
    care: ["A soft cloth and a drop of lemon juice brings the shine back, if you want it."],
    price: 650,
    mood: "accessory",
    color: "#B8934A",
    color2: "#1C1917",
    texture: "",
    maker: "Brass turners of Moradabad",
    region: "Moradabad, Uttar Pradesh",
    loom_hours: 0,
    batch: "",
    tags: "brass, spare",
    images: [["/images/renders/rod.webp", "Solid brass spine rod"]],
    variants: [
      { title: "A5", format: "A5", ruling: "", sku: "KY-A-ROD-A5", stock: 25 },
      { title: "Pocket", format: "Pocket", ruling: "", sku: "KY-A-ROD-PK", price: 550, stock: 20 },
    ],
  },
];

export const DEFAULT_SETTINGS: Record<string, string> = {
  store_name: "KĀYA",
  support_email: "hello@kaya.example",
  support_phone: "+91 00000 00000",
  free_shipping_threshold: "1500",
  standard_shipping: "99",
  express_shipping: "249",
  cod_fee: "49",
  cod_enabled: "1",
  gst_rate: "12",
  announcement: "Free shipping on orders over ₹1,500 · Cash on delivery available",
};

export async function seedCatalog(client: Client) {
  const tx = await client.transaction("write");
  try {
    for (const [i, p] of CATALOG.entries()) {
      const r = await tx.execute({
        sql: `INSERT INTO products (slug,title,subtitle,category,description,story,details,care,price,compare_at,status,featured,mood,color,color2,texture,maker,region,loom_hours,batch,tags,sort)
              VALUES (?,?,?,?,?,?,?,?,?,?, 'active', ?,?,?,?,?,?,?,?,?,?,?)`,
        args: [
          p.slug, p.title, p.subtitle, p.category, p.description, p.story, JSON.stringify(p.details), JSON.stringify(p.care),
          p.price, p.compare_at ?? null, p.featured ? 1 : 0, p.mood, p.color, p.color2, p.texture, p.maker, p.region,
          p.loom_hours, p.batch, p.tags, i,
        ],
      });
      const pid = Number(r.lastInsertRowid);
      for (const [j, [url, alt]] of p.images.entries()) {
        await tx.execute({ sql: "INSERT INTO product_images (product_id,url,alt,position) VALUES (?,?,?,?)", args: [pid, url, alt, j] });
      }
      for (const [j, v] of p.variants.entries()) {
        await tx.execute({
          sql: "INSERT INTO variants (product_id,title,format,ruling,sku,price,stock,position) VALUES (?,?,?,?,?,?,?,?)",
          args: [pid, v.title, v.format, v.ruling, v.sku, v.price ?? null, v.stock, j],
        });
      }
    }
    for (const [k, v] of Object.entries(DEFAULT_SETTINGS)) {
      await tx.execute({ sql: "INSERT OR IGNORE INTO settings (key,value) VALUES (?,?)", args: [k, v] });
    }
    await tx.execute({
      sql: "INSERT OR IGNORE INTO discounts (code,kind,value,min_subtotal) VALUES ('WELCOME10','percent',10,0)",
      args: [],
    });
    await tx.commit();
  } catch (e) {
    await tx.rollback();
    throw e;
  } finally {
    tx.close();
  }
}
