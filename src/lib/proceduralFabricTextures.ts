import * as THREE from "three";
import { fabricById, type Fabric, type FabricId, type Ruling } from "@/data/fabrics";

/**
 * Procedural textile + paper texture generator.
 * Everything is painted on HTML5 canvas: diffuse weave, bump (thread relief),
 * metalness (Zari), paper rulings, gold-foil monograms and woven provenance tags.
 * Canvases are A5-proportioned (1:1.414) so a cover maps 1:1 without stretching.
 */

export const TEX_W = 1024;
export const TEX_H = 1448;

export interface FabricTextureSet {
  map: THREE.CanvasTexture;
  bump: THREE.CanvasTexture;
  metal: THREE.CanvasTexture | null;
  diffuseCanvas: HTMLCanvasElement;
}

const cache = new Map<FabricId, FabricTextureSet>();
const canvasCache = new Map<FabricId, { diffuse: HTMLCanvasElement; bump: HTMLCanvasElement; metal: HTMLCanvasElement | null }>();

function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function makeCanvas(w: number, h: number) {
  const c = document.createElement("canvas");
  c.width = w;
  c.height = h;
  return c;
}

function ctx2d(c: HTMLCanvasElement) {
  return c.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
}

function hexToRgb(hex: string) {
  const n = parseInt(hex.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255] as const;
}

function shade(hex: string, amt: number, alpha = 1) {
  const [r, g, b] = hexToRgb(hex);
  const f = (v: number) => Math.round(Math.min(255, Math.max(0, amt >= 0 ? v + (255 - v) * amt : v * (1 + amt))));
  return `rgba(${f(r)},${f(g)},${f(b)},${alpha})`;
}

/** Reads the next/font family from a CSS variable so canvas text matches the page typography. */
export function cssFont(variable: string, fallback: string) {
  if (typeof document === "undefined") return fallback;
  const v = getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  return v ? `${v}, ${fallback}` : fallback;
}

/* ------------------------------------------------------------------ */
/* Motif painters — diffuse (d), bump (b) and optional metal (m)       */
/* ------------------------------------------------------------------ */

type Painter = (d: CanvasRenderingContext2D, b: CanvasRenderingContext2D, m: CanvasRenderingContext2D | null, f: Fabric, rnd: () => number) => void;

function mottle(d: CanvasRenderingContext2D, base: string, rnd: () => number, count: number, spread: number) {
  for (let i = 0; i < count; i++) {
    const x = rnd() * TEX_W;
    const y = rnd() * TEX_H;
    const r = 80 + rnd() * 260;
    const g = d.createRadialGradient(x, y, 0, x, y, r);
    const amt = (rnd() - 0.5) * spread;
    g.addColorStop(0, shade(base, amt, 0.35));
    g.addColorStop(1, shade(base, amt, 0));
    d.fillStyle = g;
    d.fillRect(x - r, y - r, r * 2, r * 2);
  }
}

const paintDabu: Painter = (d, b, _m, f, rnd) => {
  d.fillStyle = f.color;
  d.fillRect(0, 0, TEX_W, TEX_H);
  mottle(d, f.color, rnd, 40, 0.28);

  // Mud-resist motifs are painted on their own layer so crackle can be clipped to them.
  const layer = makeCanvas(TEX_W, TEX_H);
  const l = ctx2d(layer);
  const cream = f.colorSecondary;
  const cell = 128;
  for (let gy = 0; gy * cell < TEX_H + cell; gy++) {
    for (let gx = 0; gx * cell < TEX_W + cell; gx++) {
      const ox = gx * cell + (gy % 2 ? cell / 2 : 0) + (rnd() - 0.5) * 4;
      const oy = gy * cell + (rnd() - 0.5) * 4;
      l.globalAlpha = 0.72 + rnd() * 0.25;
      l.fillStyle = cream;
      // eight-petal Bagru botanical
      for (let p = 0; p < 8; p++) {
        l.save();
        l.translate(ox, oy);
        l.rotate((p / 8) * Math.PI * 2 + rnd() * 0.06);
        l.beginPath();
        l.ellipse(0, -17, 6.5, 14, 0, 0, Math.PI * 2);
        l.fill();
        l.restore();
      }
      l.beginPath();
      l.arc(ox, oy, 6, 0, Math.PI * 2);
      l.fillStyle = f.color;
      l.fill();
      l.beginPath();
      l.arc(ox, oy, 3, 0, Math.PI * 2);
      l.fillStyle = cream;
      l.fill();
      // tiny corner seeds
      for (const [dx, dy] of [[cell / 2, 0], [0, cell / 2]]) {
        l.beginPath();
        l.arc(ox + dx, oy + dy, 3.2, 0, Math.PI * 2);
        l.fill();
      }
    }
  }
  // geometric border bands (top and bottom) — stepped diamonds
  for (const by of [40, TEX_H - 72]) {
    l.globalAlpha = 0.85;
    l.fillStyle = cream;
    l.fillRect(0, by, TEX_W, 4);
    l.fillRect(0, by + 28, TEX_W, 4);
    for (let x = 0; x < TEX_W; x += 32) {
      l.beginPath();
      l.moveTo(x + 16, by + 7);
      l.lineTo(x + 27, by + 16);
      l.lineTo(x + 16, by + 25);
      l.lineTo(x + 5, by + 16);
      l.closePath();
      l.fill();
    }
  }
  // crackle: indigo seeping through cracks in the dried mud resist
  l.globalCompositeOperation = "source-atop";
  l.globalAlpha = 1;
  l.strokeStyle = shade(f.color, 0.08, 0.55);
  for (let i = 0; i < 900; i++) {
    let x = rnd() * TEX_W;
    let y = rnd() * TEX_H;
    l.lineWidth = 0.5 + rnd() * 1.1;
    l.beginPath();
    l.moveTo(x, y);
    for (let s = 0; s < 4; s++) {
      x += (rnd() - 0.5) * 22;
      y += (rnd() - 0.5) * 22;
      l.lineTo(x, y);
    }
    l.stroke();
  }
  for (let i = 0; i < 2500; i++) {
    l.fillStyle = shade(f.color, 0, 0.25 * rnd());
    l.fillRect(rnd() * TEX_W, rnd() * TEX_H, 2 + rnd() * 5, 2 + rnd() * 5);
  }
  d.drawImage(layer, 0, 0);

  b.fillStyle = "#777";
  b.fillRect(0, 0, TEX_W, TEX_H);
  b.globalAlpha = 0.35;
  b.drawImage(layer, 0, 0);
  b.globalAlpha = 1;
};

const paintMashru: Painter = (d, b, _m, f, rnd) => {
  const madder = "#8E2F2A";
  const saffron = f.colorSecondary;
  const stripes: { w: number; c: string }[] = [];
  const pattern = [
    { w: 120, c: f.color },
    { w: 10, c: "#F1E2C6" },
    { w: 46, c: saffron },
    { w: 8, c: madder },
    { w: 70, c: madder },
    { w: 8, c: saffron },
    { w: 24, c: f.color },
    { w: 6, c: "#F1E2C6" },
  ];
  let total = 0;
  while (total < TEX_W + 200) {
    for (const s of pattern) {
      stripes.push(s);
      total += s.w;
    }
  }
  // ikat: stripe edges feather in short irregular row-blocks
  for (let y = 0; y < TEX_H; y += 6) {
    let x = -40;
    for (const s of stripes) {
      const jitter = (rnd() - 0.5) * 7;
      d.fillStyle = s.c;
      d.fillRect(x + jitter, y, s.w + 3, 6);
      x += s.w;
      if (x > TEX_W + 40) break;
    }
  }
  // ikat chevrons inside the wide terracotta stripes
  d.save();
  d.filter = "blur(1.2px)";
  let x = -40;
  for (const s of stripes) {
    if (s.w === 120) {
      for (let y = 30; y < TEX_H; y += 96) {
        d.fillStyle = shade(saffron, 0.1, 0.9);
        const cx = x + s.w / 2 + (rnd() - 0.5) * 4;
        d.beginPath();
        d.moveTo(cx - 34, y + 24);
        d.lineTo(cx, y);
        d.lineTo(cx + 34, y + 24);
        d.lineTo(cx + 34, y + 38);
        d.lineTo(cx, y + 14);
        d.lineTo(cx - 34, y + 38);
        d.closePath();
        d.fill();
        d.fillStyle = shade(madder, 0, 0.85);
        d.fillRect(cx - 5, y + 44, 10, 18);
      }
    }
    x += s.w;
    if (x > TEX_W + 40) break;
  }
  d.restore();
  mottle(d, f.color, rnd, 18, 0.2);

  b.fillStyle = "#808080";
  b.fillRect(0, 0, TEX_W, TEX_H);
};

const paintTussar: Painter = (d, b, _m, f, rnd) => {
  d.fillStyle = f.color;
  d.fillRect(0, 0, TEX_W, TEX_H);
  mottle(d, f.color, rnd, 60, 0.16);
  b.fillStyle = "#707070";
  b.fillRect(0, 0, TEX_W, TEX_H);

  // hand-spun slubs: tapered thick spots along the weft
  for (let i = 0; i < 2600; i++) {
    const y = rnd() * TEX_H;
    const x = rnd() * TEX_W;
    const len = 18 + rnd() * rnd() * 220;
    const th = 1 + rnd() * rnd() * 5;
    const light = rnd() > 0.45;
    const col = light ? shade(f.color, 0.35, 0.55) : shade(f.colorSecondary, -0.12, 0.45);
    for (const ox of [0, -TEX_W, TEX_W]) {
      d.fillStyle = col;
      d.beginPath();
      d.ellipse(x + ox, y, len / 2, th / 2, 0, 0, Math.PI * 2);
      d.fill();
      b.fillStyle = `rgba(255,255,255,${0.25 + th * 0.12})`;
      b.beginPath();
      b.ellipse(x + ox, y, len / 2, th / 2 + 0.6, 0, 0, Math.PI * 2);
      b.fill();
    }
  }
  // khadi warp irregularities
  for (let i = 0; i < 70; i++) {
    const x = rnd() * TEX_W;
    d.fillStyle = shade(f.colorSecondary, -0.05, 0.18);
    d.fillRect(x, 0, 1 + rnd() * 2.5, TEX_H);
    b.fillStyle = "rgba(255,255,255,0.18)";
    b.fillRect(x, 0, 1 + rnd() * 2.5, TEX_H);
  }
};

const paintChanderi: Painter = (d, b, m, f, rnd) => {
  const gold = f.colorSecondary;
  d.fillStyle = f.color;
  d.fillRect(0, 0, TEX_W, TEX_H);
  mottle(d, f.color, rnd, 30, 0.18);
  // sheer vertical shadow stripes typical of Chanderi
  for (let x = 0; x < TEX_W; x += 28) {
    d.fillStyle = shade(f.color, 0.06, 0.35);
    d.fillRect(x, 0, 2, TEX_H);
  }
  b.fillStyle = "#6a6a6a";
  b.fillRect(0, 0, TEX_W, TEX_H);
  if (m) {
    m.fillStyle = "#000";
    m.fillRect(0, 0, TEX_W, TEX_H);
  }

  const goldFill = (fn: (c: CanvasRenderingContext2D, style: string) => void) => {
    fn(d, gold);
    fn(b, "#fff");
    if (m) fn(m, "#fff");
  };

  // half-drop field of coin butis and four-petal zari florets
  const step = 96;
  for (let gy = 0; gy * step < TEX_H; gy++) {
    for (let gx = 0; gx * step < TEX_W + step; gx++) {
      const cx = gx * step + (gy % 2 ? step / 2 : 0);
      const cy = gy * step + 60;
      if (cy > TEX_H - 210 || cy < 150) continue;
      goldFill((c, s) => {
        c.fillStyle = s;
        if ((gx + gy) % 3 === 0) {
          for (let p = 0; p < 4; p++) {
            c.save();
            c.translate(cx, cy);
            c.rotate((p * Math.PI) / 2 + Math.PI / 4);
            c.beginPath();
            c.ellipse(0, -7, 3.6, 7.5, 0, 0, Math.PI * 2);
            c.fill();
            c.restore();
          }
        } else {
          c.beginPath();
          c.arc(cx, cy, 4.5, 0, Math.PI * 2);
          c.fill();
        }
      });
    }
  }

  // zari border (temple 'kangura' band) at the base, slimmer echo at the head
  const band = (y: number, height: number, flip: boolean) => {
    goldFill((c, s) => {
      c.fillStyle = s;
      c.fillRect(0, y, TEX_W, 5);
      c.fillRect(0, y + height - 5, TEX_W, 5);
      c.fillRect(0, y + 12, TEX_W, 2);
      c.fillRect(0, y + height - 14, TEX_W, 2);
      const tw = 36;
      for (let x = 0; x < TEX_W; x += tw) {
        c.beginPath();
        const base = flip ? y + 20 : y + height - 20;
        const peak = flip ? y + height - 20 : y + 20;
        c.moveTo(x + 4, base);
        c.lineTo(x + 4, (base + peak) / 2);
        c.lineTo(x + tw / 2, peak);
        c.lineTo(x + tw - 4, (base + peak) / 2);
        c.lineTo(x + tw - 4, base);
        c.closePath();
        c.fill();
      }
    });
    // fine zari striations
    for (let yy = y; yy < y + height; yy += 3) {
      d.fillStyle = shade(gold, 0.35, 0.25);
      d.fillRect(0, yy, TEX_W, 1);
    }
  };
  band(TEX_H - 170, 120, false);
  band(48, 64, true);

  for (let i = 0; i < 400; i++) {
    d.fillStyle = shade(gold, 0.4, 0.4 * rnd());
    d.fillRect(rnd() * TEX_W, rnd() * TEX_H, 1, 1);
  }
};

const paintJamdani: Painter = (d, b, _m, f, rnd) => {
  const kora = f.colorSecondary;
  d.fillStyle = f.color;
  d.fillRect(0, 0, TEX_W, TEX_H);
  mottle(d, f.color, rnd, 50, 0.2);
  b.fillStyle = "#737373";
  b.fillRect(0, 0, TEX_W, TEX_H);

  // discontinuous supplementary weft: motifs built from short horizontal passes
  const diamond = (cx: number, cy: number, r: number) => {
    for (let row = -r; row <= r; row += 4) {
      const half = r - Math.abs(row);
      const hollow = half > 8 && Math.abs(row) < r - 10;
      const segs = hollow ? [[-half, -half + 6], [half - 6, half]] : [[-half, half]];
      for (const [a, z] of segs) {
        const jitter = (rnd() - 0.5) * 1.4;
        d.fillStyle = shade(kora, 0, 0.82 + rnd() * 0.15);
        d.fillRect(cx + a + jitter, cy + row, z - a, 2.4);
        b.fillStyle = "rgba(255,255,255,0.9)";
        b.fillRect(cx + a + jitter, cy + row, z - a, 2.4);
      }
    }
    d.fillStyle = shade(kora, 0, 0.9);
    d.fillRect(cx - 2, cy - 2, 4, 4);
  };
  const step = 112;
  for (let gy = 0; gy * step < TEX_H + step; gy++) {
    for (let gx = 0; gx * step < TEX_W + step; gx++) {
      const cx = gx * step + (gy % 2 ? step / 2 : 0);
      const cy = gy * step + 40;
      if ((gx + gy) % 2 === 0) diamond(cx, cy, 22);
      else {
        for (let k = 0; k < 3; k++) {
          d.fillStyle = shade(kora, 0, 0.8);
          d.fillRect(cx - 8 + k * 7, cy, 4, 2.4);
          b.fillStyle = "rgba(255,255,255,0.8)";
          b.fillRect(cx - 8 + k * 7, cy, 4, 2.4);
        }
      }
    }
  }
  // stepped vine column near the fore-edge
  for (let y = 0; y < TEX_H; y += 26) {
    const x = TEX_W - 90 + Math.sin(y / 40) * 16;
    d.fillStyle = shade(kora, 0, 0.85);
    d.fillRect(x, y, 14, 2.4);
    d.fillRect(x + 4, y + 8, 6, 2.4);
    b.fillStyle = "#fff";
    b.fillRect(x, y, 14, 2.4);
  }
};

const painters: Record<Fabric["weave"], Painter> = {
  dabu: paintDabu,
  mashru: paintMashru,
  tussar: paintTussar,
  chanderi: paintChanderi,
  jamdani: paintJamdani,
};

/* ------------------------------------------------------------------ */
/* Thread-level weave relief applied per pixel                         */
/* ------------------------------------------------------------------ */

const weaveConfig: Record<Fabric["weave"], { period: number; strength: number; satin: boolean; noise: number }> = {
  dabu: { period: 6, strength: 0.2, satin: false, noise: 0.06 },
  mashru: { period: 4, strength: 0.16, satin: true, noise: 0.03 },
  tussar: { period: 5, strength: 0.14, satin: false, noise: 0.07 },
  chanderi: { period: 3, strength: 0.12, satin: false, noise: 0.03 },
  jamdani: { period: 3, strength: 0.12, satin: false, noise: 0.04 },
};

function applyWeave(diffuse: HTMLCanvasElement, bump: HTMLCanvasElement, weave: Fabric["weave"], rnd: () => number) {
  const { period, strength, satin, noise } = weaveConfig[weave];
  const dctx = ctx2d(diffuse);
  const bctx = ctx2d(bump);
  const dImg = dctx.getImageData(0, 0, TEX_W, TEX_H);
  const bImg = bctx.getImageData(0, 0, TEX_W, TEX_H);
  const dd = dImg.data;
  const bd = bImg.data;
  // per-thread thickness irregularity for a hand-spun feel
  const warpVar = new Float32Array(Math.ceil(TEX_W / period) + 1).map(() => 0.75 + rnd() * 0.5);
  const weftVar = new Float32Array(Math.ceil(TEX_H / period) + 1).map(() => 0.75 + rnd() * 0.5);

  for (let y = 0; y < TEX_H; y++) {
    const j = (y / period) | 0;
    const fy = (y % period) / period;
    for (let x = 0; x < TEX_W; x++) {
      const i = (x / period) | 0;
      const fx = (x % period) / period;
      const warpOver = satin ? (i * 3 + j) % 5 !== 0 : (i + j) % 2 === 0;
      const h = warpOver ? Math.sin(Math.PI * fx) * warpVar[i] : Math.sin(Math.PI * fy) * weftVar[j];
      const n = (rnd() - 0.5) * noise;
      const k = 1 - strength * (1 - Math.min(1, h)) + n;
      const p = (y * TEX_W + x) * 4;
      dd[p] = Math.min(255, dd[p] * k);
      dd[p + 1] = Math.min(255, dd[p + 1] * k);
      dd[p + 2] = Math.min(255, dd[p + 2] * k);
      const bv = bd[p] * 0.55 + h * 115 + n * 300;
      bd[p] = bd[p + 1] = bd[p + 2] = Math.max(0, Math.min(255, bv));
    }
  }
  dctx.putImageData(dImg, 0, 0);
  bctx.putImageData(bImg, 0, 0);
}

function seedOf(id: string) {
  let h = 2166136261;
  for (let i = 0; i < id.length; i++) h = Math.imul(h ^ id.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Paints (once) the raw canvases for a fabric. Also used by the cursor loupe. */
export function getFabricCanvases(id: FabricId) {
  const hit = canvasCache.get(id);
  if (hit) return hit;
  const f = fabricById[id];
  const rnd = mulberry32(seedOf(id));
  const diffuse = makeCanvas(TEX_W, TEX_H);
  const bump = makeCanvas(TEX_W, TEX_H);
  const metal = f.weave === "chanderi" ? makeCanvas(TEX_W, TEX_H) : null;
  painters[f.weave](ctx2d(diffuse), ctx2d(bump), metal ? ctx2d(metal) : null, f, rnd);
  applyWeave(diffuse, bump, f.weave, rnd);
  const entry = { diffuse, bump, metal };
  canvasCache.set(id, entry);
  return entry;
}

function toTexture(canvas: HTMLCanvasElement, srgb: boolean) {
  const t = new THREE.CanvasTexture(canvas);
  t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace;
  t.anisotropy = 8;
  t.wrapS = t.wrapT = THREE.ClampToEdgeWrapping;
  t.needsUpdate = true;
  return t;
}

export function getFabricTextures(id: FabricId): FabricTextureSet {
  const hit = cache.get(id);
  if (hit) return hit;
  const { diffuse, bump, metal } = getFabricCanvases(id);
  const set: FabricTextureSet = {
    map: toTexture(diffuse, true),
    bump: toTexture(bump, false),
    metal: metal ? toTexture(metal, false) : null,
    diffuseCanvas: diffuse,
  };
  cache.set(id, set);
  return set;
}

export function disposeFabricTextures() {
  cache.forEach((s) => {
    s.map.dispose();
    s.bump.dispose();
    s.metal?.dispose();
  });
  cache.clear();
}

/* ------------------------------------------------------------------ */
/* Paper, buckram, monogram and provenance tag                         */
/* ------------------------------------------------------------------ */

function paperBase(c: CanvasRenderingContext2D, w: number, h: number, seed: number) {
  const rnd = mulberry32(seed);
  c.fillStyle = "#F4EEE2";
  c.fillRect(0, 0, w, h);
  // cotton rag fibres
  for (let i = 0; i < 1400; i++) {
    c.strokeStyle = `rgba(150,130,100,${0.04 + rnd() * 0.05})`;
    c.lineWidth = 0.6;
    const x = rnd() * w;
    const y = rnd() * h;
    c.beginPath();
    c.moveTo(x, y);
    c.quadraticCurveTo(x + (rnd() - 0.5) * 14, y + (rnd() - 0.5) * 14, x + (rnd() - 0.5) * 18, y + (rnd() - 0.5) * 18);
    c.stroke();
  }
}

export function createPaperTexture(ruling: Ruling, pageIndex = 0) {
  const w = 724;
  const h = 1024;
  const canvas = makeCanvas(w, h);
  const c = ctx2d(canvas);
  paperBase(c, w, h, 99 + pageIndex);
  const mono = cssFont("--font-jetbrains", "monospace");
  const ink = "rgba(101,94,87,";
  const step = w / 29.6; // 5mm on a 148mm page

  if (ruling === "dot") {
    c.fillStyle = `${ink}0.55)`;
    for (let y = step; y < h - step / 2; y += step) {
      for (let x = step; x < w - step / 2; x += step) {
        c.beginPath();
        c.arc(x, y, 1.6, 0, Math.PI * 2);
        c.fill();
      }
    }
  } else if (ruling === "architectural") {
    const split = w * 0.5;
    c.strokeStyle = `${ink}0.22)`;
    c.lineWidth = 1;
    for (let x = step; x < split; x += step) {
      c.beginPath();
      c.moveTo(x, step * 3);
      c.lineTo(x, h - step);
      c.stroke();
    }
    for (let y = step * 3; y < h - step / 2; y += step) {
      c.beginPath();
      c.moveTo(step, y);
      c.lineTo(split, y);
      c.stroke();
    }
    c.strokeStyle = `${ink}0.35)`;
    for (let y = step * 4; y < h - step; y += step * 1.4) {
      c.beginPath();
      c.moveTo(split + step * 0.6, y);
      c.lineTo(w - step, y);
      c.stroke();
    }
    c.strokeStyle = "rgba(184,147,74,0.9)";
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(split, step * 1.2);
    c.lineTo(split, h - step);
    c.stroke();
    c.strokeStyle = `${ink}0.6)`;
    c.lineWidth = 1.2;
    c.strokeRect(step, step * 1.2, w - step * 2, step * 1.4);
    c.fillStyle = `${ink}0.75)`;
    c.font = `18px ${mono}`;
    c.fillText("PROJECT", step * 1.3, step * 2.15);
    c.fillText("DATE", split + step * 0.6, step * 2.15);
  }
  c.fillStyle = `${ink}0.6)`;
  c.font = `15px ${mono}`;
  const label = ruling === "dot" ? "5MM DOT GRID" : ruling === "unruled" ? "UNRULED ARCHIVAL" : "ARCHITECTURAL SPLIT";
  c.fillText(`KĀYA — ${label} — 120GSM COTTON RAG`, step, h - step * 0.35);
  c.textAlign = "right";
  c.fillText(String(pageIndex + 1).padStart(3, "0"), w - step, h - step * 0.35);

  const t = toTexture(canvas, true);
  return t;
}

export function createPaperEdgeTexture() {
  const canvas = makeCanvas(256, 512);
  const c = ctx2d(canvas);
  const rnd = mulberry32(7);
  c.fillStyle = "#EFE7D8";
  c.fillRect(0, 0, 256, 512);
  for (let x = 0; x < 256; x += 2) {
    c.fillStyle = `rgba(120,100,80,${0.05 + rnd() * 0.12})`;
    c.fillRect(x, 0, 1, 512);
  }
  for (let x = 0; x < 256; x += 2) {
    for (let y = 0; y < 512; y += 4) {
      if (rnd() > 0.92) {
        c.fillStyle = "rgba(255,252,245,0.6)";
        c.fillRect(x, y, 1, 3);
      }
    }
  }
  const t = toTexture(canvas, true);
  t.wrapS = t.wrapT = THREE.RepeatWrapping;
  return t;
}

export function createBuckramTexture() {
  const canvas = makeCanvas(512, 724);
  const c = ctx2d(canvas);
  const rnd = mulberry32(31);
  c.fillStyle = "#8C8273";
  c.fillRect(0, 0, 512, 724);
  for (let y = 0; y < 724; y += 3) {
    c.fillStyle = `rgba(60,52,42,${0.06 + rnd() * 0.08})`;
    c.fillRect(0, y, 512, 1);
  }
  for (let x = 0; x < 512; x += 3) {
    c.fillStyle = `rgba(200,190,170,${0.04 + rnd() * 0.06})`;
    c.fillRect(x, 0, 1, 724);
  }
  c.fillStyle = "rgba(244,238,226,0.75)";
  c.font = `20px ${cssFont("--font-jetbrains", "monospace")}`;
  c.fillText("RECYCLED BUCKRAM CORE — 2.4MM", 28, 690);
  return toTexture(canvas, true);
}

/** Unbleached khadi lining for the inside of the boards, edged with a hand-stitched seam. */
export function createLiningTexture() {
  const canvas = makeCanvas(512, 724);
  const c = ctx2d(canvas);
  const rnd = mulberry32(53);
  c.fillStyle = "#EDE4D3";
  c.fillRect(0, 0, 512, 724);
  for (let y = 0; y < 724; y += 2) {
    c.fillStyle = `rgba(120,100,70,${0.03 + rnd() * 0.05})`;
    c.fillRect(0, y, 512, 1);
  }
  for (let x = 0; x < 512; x += 2) {
    c.fillStyle = `rgba(255,250,240,${0.03 + rnd() * 0.05})`;
    c.fillRect(x, 0, 1, 724);
  }
  c.setLineDash([9, 6]);
  c.strokeStyle = "rgba(184,147,74,0.85)";
  c.lineWidth = 2;
  c.strokeRect(16, 16, 480, 692);
  return toTexture(canvas, true);
}

export function createMonogramTexture(text: string) {
  const canvas = makeCanvas(512, 256);
  const c = ctx2d(canvas);
  c.clearRect(0, 0, 512, 256);
  if (text) {
    const serif = cssFont("--font-cormorant", "Georgia, serif");
    c.textAlign = "center";
    c.textBaseline = "middle";
    c.font = `italic 500 150px ${serif}`;
    const g = c.createLinearGradient(0, 40, 0, 220);
    g.addColorStop(0, "#F3DFA2");
    g.addColorStop(0.45, "#C5A059");
    g.addColorStop(0.55, "#B08A43");
    g.addColorStop(1, "#E8CF8A");
    // debossed shadow then foil
    c.fillStyle = "rgba(20,15,10,0.45)";
    c.fillText(text.split("").join("·"), 258, 134);
    c.fillStyle = g;
    c.fillText(text.split("").join("·"), 256, 130);
  }
  const t = toTexture(canvas, true);
  return t;
}

export function createProvenanceTagTexture(ngo: string, region: string, coords: string) {
  const canvas = makeCanvas(640, 320);
  const c = ctx2d(canvas);
  const rnd = mulberry32(seedOf(ngo));
  c.fillStyle = "#F3EDE2";
  c.fillRect(0, 0, 640, 320);
  for (let y = 0; y < 320; y += 2) {
    c.fillStyle = `rgba(28,25,23,${0.02 + rnd() * 0.03})`;
    c.fillRect(0, y, 640, 1);
  }
  c.setLineDash([10, 7]);
  c.strokeStyle = "rgba(184,147,74,0.9)";
  c.lineWidth = 3;
  c.strokeRect(14, 14, 612, 292);
  c.setLineDash([]);
  const mono = cssFont("--font-jetbrains", "monospace");
  const serif = cssFont("--font-cormorant", "Georgia, serif");
  c.fillStyle = "#655E57";
  c.font = `20px ${mono}`;
  c.textAlign = "center";
  c.fillText("CRAFTED WITH", 320, 78);
  c.fillStyle = "#1C1917";
  c.font = `italic 500 46px ${serif}`;
  c.fillText(ngo, 320, 145);
  c.fillStyle = "#655E57";
  c.font = `18px ${mono}`;
  c.fillText(region.toUpperCase(), 320, 200);
  c.fillText(coords, 320, 232);
  c.fillStyle = "#B8934A";
  c.font = `500 26px ${serif}`;
  c.fillText("KĀYA · काया", 320, 282);
  return toTexture(canvas, true);
}
