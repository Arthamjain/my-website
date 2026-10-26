# KĀYA — Wear Your Inner Weather

An interactive 3D e-commerce experience for modular brass-spined journals with interchangeable handloomed Indian heritage fabric covers.

Built with Next.js (App Router), TypeScript, Tailwind CSS v4, Three.js via React Three Fiber + Drei, GSAP ScrollTrigger, Lenis, Framer Motion and Zustand.

## Run it

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

## Where things live

| Path | What it does |
| --- | --- |
| `src/data/fabrics.ts` | The five covers: psychology, material settings, NGO provenance, pricing, batch scarcity, care |
| `src/store/useKaya.ts` | Zustand store: mood, open/close, ruling, format, monogram, sound, loupe, cart, modals |
| `src/components/canvas/Notebook3D.tsx` | Procedural notebook: hinged boards, sliding sleeve (brass spring physics), brass rod, arching pages, monogram, hotspots |
| `src/components/canvas/Scene.tsx` | Fixed canvas, studio Lightformer environment (no HDR download), camera rig + macro loupe raking light |
| `src/lib/proceduralFabricTextures.ts` | Canvas-painted weave diffuse/bump/metal maps, paper rulings, lining, monogram foil, provenance tag |
| `src/lib/soundEngine.ts` | Web Audio synthesis: linen brush, khadi rustle, brass click, page turn |
| `src/components/sections/*` | Hero, Chromatic Diagnosis, Anatomy (scroll-scrubbed explode), Ledger, Atelier, Reviews |
| `src/components/ui/*` | Cursor, curtain buttons, mood dock, bag drawer, checkout, passport, preloader |

There are no external assets: every texture is painted on `<canvas>` and every sound is synthesised at runtime.

## Before going live

- The checkout is a demonstration and processes no payments. Connect a real payment provider before launch.
- The NGO partner names, impact metrics (72% margin share, loom hours, batch counts) and field-note testimonials are placeholder copy. Confirm each partnership and figure with the organisations before publishing.
