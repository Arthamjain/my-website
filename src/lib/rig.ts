import type { Object3D } from "three";

/**
 * Mutable, non-reactive values written by scroll triggers and read every frame
 * by the WebGL scene. Kept outside React state so scrubbing never re-renders.
 */
export const rig = {
  /** 0 → 1 progress through the exploded-anatomy choreography. */
  explode: 0,
  /** Point on the front sleeve the macro loupe camera dollies to. */
  coverAnchor: null as Object3D | null,
};

/** DOM layer above the editorial content where 3D hotspot pins are portalled. */
export const htmlPortal = { current: null as HTMLElement | null };
