import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));

const inr = new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 });
export const formatINR = (value: number) => `₹${inr.format(value)}`;

export const SILK = [0.22, 1, 0.36, 1] as const;
export const BRASS_SPRING = { type: "spring", stiffness: 280, damping: 26, mass: 0.9 } as const;

export const smoothstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
