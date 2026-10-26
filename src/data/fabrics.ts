export type FabricId = "dabu" | "mashru" | "tussar" | "chanderi" | "jamdani";

export type WeavePattern = "dabu" | "mashru" | "tussar" | "chanderi" | "jamdani";

export interface Fabric {
  id: FabricId;
  index: string;
  persona: string;
  name: string;
  shortName: string;
  weave: WeavePattern;
  region: string;
  cluster: string;
  emotion: string;
  psychology: string;
  signal: string;
  hook: string;
  color: string;
  colorSecondary: string;
  aura: string;
  material: {
    roughness: number;
    metalness: number;
    bumpScale: number;
    sheen: number;
    anisotropy: number;
  };
  ngo: string;
  ngoNote: string;
  loomHours: number;
  loomLabel: string;
  coordinates: string;
  priceComplete: number;
  priceSleeve: number;
  batch: { number: string; remaining: number; total: number };
  care: string[];
  complement: FabricId;
}

export const fabrics: Fabric[] = [
  {
    id: "dabu",
    index: "01",
    persona: "The Grounded Soul",
    name: "Indigo Dabu Mud-Resist",
    shortName: "Indigo Dabu",
    weave: "dabu",
    region: "Bagru, Rajasthan",
    cluster: "Bagru Cluster",
    emotion: "Deep Focus, Cognitive Stillness & Analytical Clarity",
    psychology:
      "Deep indigo sits at the low-arousal end of the spectrum. It lowers visual overstimulation during deep work, so the eye rests while the mind narrows onto a single problem.",
    signal: "Reads as composed, considered and quietly rigorous — the person in the room who has already done the reading.",
    hook: "For the mind with 47 open browser tabs. Close 46 of them.",
    color: "#263859",
    colorSecondary: "#D9CDB4",
    aura: "#E8EEF5",
    material: { roughness: 0.85, metalness: 0, bumpScale: 0.045, sheen: 0.35, anisotropy: 0 },
    ngo: "Saheli Artisan Collective",
    ngoNote: "Supports 140+ women master block-printers",
    loomHours: 18,
    loomLabel: "18 Loom & Vat Hours",
    coordinates: "26.8143° N, 75.5492° E",
    priceComplete: 2450,
    priceSleeve: 950,
    batch: { number: "04", remaining: 14, total: 50 },
    care: [
      "Dry-brush the weave with a soft clothes brush.",
      "Spot-clean with cold water only; natural indigo mellows beautifully.",
      "Keep out of harsh direct sun for long periods.",
    ],
    complement: "jamdani",
  },
  {
    id: "mashru",
    index: "02",
    persona: "The Audacious Spark",
    name: "Marigold & Madder Mashru",
    shortName: "Marigold Mashru",
    weave: "mashru",
    region: "Patan, Gujarat",
    cluster: "Patan Cluster",
    emotion: "Creative Euphoria, Dopamine Ignition & Unapologetic Optimism",
    psychology:
      "Saffron and madder are high-arousal warm hues associated with energy and approach behaviour. The satin warp catches light as you move, so the cover feels alive in the hand.",
    signal: "Reads as magnetic and generous — an open invitation to start the conversation.",
    hook: "Wear your loudest ideas on your sleeve. Literally.",
    color: "#C85A32",
    colorSecondary: "#E2A13B",
    aura: "#FBF0EB",
    material: { roughness: 0.32, metalness: 0.15, bumpScale: 0.03, sheen: 0.6, anisotropy: 0.7 },
    ngo: "Khamir Craft Resource Center",
    ngoNote: "Sustaining Kachchh's living craft ecosystems",
    loomHours: 24,
    loomLabel: "24 Hand-Loom Hours",
    coordinates: "23.8493° N, 72.1266° E",
    priceComplete: 2850,
    priceSleeve: 1250,
    batch: { number: "07", remaining: 9, total: 40 },
    care: [
      "Silk warp: store away from damp and wipe with a dry cloth.",
      "Never wring; press flat under a clean cotton cloth if creased.",
      "Colour may soften with years of use — that is the patina.",
    ],
    complement: "dabu",
  },
  {
    id: "tussar",
    index: "03",
    persona: "The Unhurried Mind",
    name: "Raw Ahimsa Tussar & Khadi",
    shortName: "Raw Tussar",
    weave: "tussar",
    region: "Bhagalpur, Bihar",
    cluster: "Bhagalpur Cluster",
    emotion: "Radical Acceptance, Sensory Detox & Minimalist Serenity",
    psychology:
      "Undyed, low-saturation neutrals remove chromatic demand entirely. With nothing to decode, attention drifts back to the page — a sensory reset in textile form.",
    signal: "Reads as unbothered and self-possessed — someone with nothing to prove.",
    hook: "Unapologetically raw. Zero dye, zero noise, zero pretension.",
    color: "#D8CBB8",
    colorSecondary: "#B9A88F",
    aura: "#F7F4EF",
    material: { roughness: 0.92, metalness: 0, bumpScale: 0.06, sheen: 0.25, anisotropy: 0 },
    ngo: "WomenWeave Charitable Trust",
    ngoNote: "Champions women hand-spinners and weavers",
    loomHours: 16,
    loomLabel: "16 Hand-Spun Charkha Hours",
    coordinates: "25.2425° N, 86.9842° E",
    priceComplete: 2250,
    priceSleeve: 850,
    batch: { number: "02", remaining: 21, total: 60 },
    care: [
      "Slubs are hand-spun signatures, not flaws — never trim them.",
      "Brush gently along the weave to lift dust.",
      "Air in shade; the raw silk deepens in tone over time.",
    ],
    complement: "mashru",
  },
  {
    id: "chanderi",
    index: "04",
    persona: "The Sovereign Heart",
    name: "Forest Zari Chanderi Brocade",
    shortName: "Zari Chanderi",
    weave: "chanderi",
    region: "Chanderi, Madhya Pradesh",
    cluster: "Chanderi Cluster",
    emotion: "Quiet Authority, Decisive Leadership & Grounded Ambition",
    psychology:
      "Deep green carries associations of stability and growth; restrained gold signals value without spectacle. Together they cue competence before you have said a word.",
    signal: "Reads as authoritative and steady — power that doesn't need to shout.",
    hook: "Boardroom armor woven on a pit loom. Power doesn't need to shout.",
    color: "#2D4236",
    colorSecondary: "#C5A059",
    aura: "#EDF2EF",
    material: { roughness: 0.45, metalness: 0.38, bumpScale: 0.035, sheen: 0.4, anisotropy: 0.3 },
    ngo: "Bunkar Vikas Sanstha",
    ngoNote: "A weaver-led federation of Chanderi pit-loom families",
    loomHours: 32,
    loomLabel: "32 Pit-Loom Brocade Hours",
    coordinates: "24.7161° N, 78.1384° E",
    priceComplete: 3150,
    priceSleeve: 1450,
    batch: { number: "03", remaining: 6, total: 30 },
    care: [
      "Zari is real metallic thread: keep away from perfume and moisture.",
      "Wrap in the muslin pouch when not in use to slow tarnish.",
      "Never iron directly over the brocade.",
    ],
    complement: "tussar",
  },
  {
    id: "jamdani",
    index: "05",
    persona: "The Poetic Rebel",
    name: "Rosewater & Kora Jamdani",
    shortName: "Rose Jamdani",
    weave: "jamdani",
    region: "Nadia, West Bengal",
    cluster: "Nadia Cluster",
    emotion: "Emotional Vulnerability, Romantic Intuition & Lyrical Flow",
    psychology:
      "Dusty rose is a soft, low-contrast warm tone linked with tenderness and openness. The floating kora motifs give the eye a slow rhythm to follow — good company for unfinished thoughts.",
    signal: "Reads as tender and intuitive — someone who notices what others miss.",
    hook: "For late-night poetry, half-baked manifestos, and gentle rebellion.",
    color: "#C98CA7",
    colorSecondary: "#F2E8DC",
    aura: "#F9F1F5",
    material: { roughness: 0.65, metalness: 0, bumpScale: 0.04, sheen: 0.55, anisotropy: 0 },
    ngo: "Antaran Artisan Initiative",
    ngoNote: "Antaran by Tata Trusts — craft-based livelihoods",
    loomHours: 28,
    loomLabel: "28 Jamdani Weave Hours",
    coordinates: "23.4710° N, 88.5565° E",
    priceComplete: 2650,
    priceSleeve: 1100,
    batch: { number: "05", remaining: 11, total: 45 },
    care: [
      "Featherlight muslin: handle by the edges, store flat.",
      "Spot-clean with diluted mild soap and cold water.",
      "Let it breathe — avoid sealed plastic storage.",
    ],
    complement: "dabu",
  },
];

export const fabricById = Object.fromEntries(fabrics.map((f) => [f.id, f])) as Record<FabricId, Fabric>;

export type Ruling = "dot" | "unruled" | "architectural";
export const rulings: { id: Ruling; label: string }[] = [
  { id: "dot", label: "5mm Dot Grid" },
  { id: "unruled", label: "Unruled Archival" },
  { id: "architectural", label: "Architectural Split" },
];

export type Format = "a5" | "pocket";
export const formats: { id: Format; label: string; dims: string }[] = [
  { id: "a5", label: "A5 Classic", dims: "148×210mm" },
  { id: "pocket", label: "Pocket Field Notes", dims: "105×148mm" },
];

export type Tier = 1 | 2 | 3;
export const tiers: { id: Tier; numeral: string; name: string; detail: string; price: number | null; badge?: string }[] = [
  { id: 1, numeral: "I", name: "The Solo Ritual", detail: "1 Brass Journal + 1 Heritage Cover", price: null },
  {
    id: 2,
    numeral: "II",
    name: "The Mood Wardrobe",
    detail: "1 Brass Journal + 3 Interchangeable Covers for Focus, Spark & Rest + Free Brass Monogram",
    price: 3850,
    badge: "Most chosen — save 22%",
  },
  {
    id: 3,
    numeral: "III",
    name: "The Complete Chromatic Archive",
    detail: "1 Brass Journal + All 5 Heritage Covers + Handcrafted Teakwood Desk Cradle",
    price: 5490,
  },
];

/** Share of a cover's price that reaches the artisan cluster (72% of a ~40% cover margin). */
export const artisanShare = (fabric: Fabric) => Math.round(fabric.priceSleeve * 0.72 * 0.4);
