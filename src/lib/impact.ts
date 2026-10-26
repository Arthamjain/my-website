import { artisanShare, fabricById, type FabricId } from "@/data/fabrics";
import type { CartItem } from "@/store/useKaya";

export interface ImpactLine {
  ngo: string;
  cluster: string;
  amount: number;
  hours: number;
  color: string;
}

/** Rupees and loom hours each order returns to partner clusters, grouped by NGO. */
export function computeImpact(items: CartItem[]) {
  const byNgo = new Map<string, ImpactLine>();
  for (const item of items) {
    for (const id of item.fabricIds) {
      const f = fabricById[id];
      const line = byNgo.get(f.ngo) ?? { ngo: f.ngo, cluster: f.cluster, amount: 0, hours: 0, color: f.color };
      line.amount += artisanShare(f) * item.qty;
      line.hours += f.loomHours * item.qty;
      byNgo.set(f.ngo, line);
    }
  }
  const lines = [...byNgo.values()].sort((a, b) => b.amount - a.amount);
  return {
    lines,
    amount: lines.reduce((n, l) => n + l.amount, 0),
    hours: lines.reduce((n, l) => n + l.hours, 0),
  };
}

export function impactSentence(ids: FabricId[]) {
  const hours = ids.reduce((n, id) => n + fabricById[id].loomHours, 0);
  const places = [...new Set(ids.map((id) => fabricById[id].region.split(",")[0]))];
  const where = places.length > 2 ? `${places.slice(0, -1).join(", ")} & ${places.at(-1)}` : places.join(" & ");
  return `This order funds ${hours} hours of fair-wage handloom weaving in ${where}.`;
}
