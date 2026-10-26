import type { Fabric } from "@/components/three/NotebookModel";

/** Physical settings for each cover cloth in the 3D viewer and render stage. */
export const FABRICS_3D: Record<string, Fabric & { ribbon: string }> = {
  dabu: { texture: "/images/fabric/tex-dabu.jpg", tile: 2.2, color2: "#E6DCC8", ribbon: "#B8934A", roughness: 0.9, sheen: 0.35 },
  mashru: { texture: "/images/fabric/tex-mashru.jpg", tile: 2.2, color2: "#F0DDBF", ribbon: "#8E2F23", roughness: 0.55, sheen: 0.8 },
  tussar: { texture: "/images/fabric/tex-tussar.jpg", tile: 2.2, color2: "#EFE7DA", ribbon: "#8A7558", roughness: 0.92, sheen: 0.3 },
  chanderi: { texture: "/images/fabric/tex-chanderi.jpg", tile: 2.2, color2: "#E8DEC9", ribbon: "#C5A059", roughness: 0.6, sheen: 0.6 },
  jamdani: { texture: "/images/fabric/tex-jamdani.jpg", tile: 1.6, color2: "#F4E8E4", ribbon: "#A3485F", roughness: 0.7, sheen: 0.7 },
};

/** Products are tied to a cloth by slug prefix, e.g. "dabu-journal". */
export const fabricForSlug = (slug: string) => {
  const key = slug.split("-")[0];
  return FABRICS_3D[key] ? { key, ...FABRICS_3D[key] } : null;
};
