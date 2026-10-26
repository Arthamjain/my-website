/** Catalogue constants safe to import from client components. */
export const CATEGORIES: { id: string; label: string; blurb: string }[] = [
  { id: "journal", label: "Journals", blurb: "Brass-spined, cotton rag, dressed in hand-loomed cloth." },
  { id: "cover", label: "Covers", blurb: "Change the mood of the journal you already have." },
  { id: "set", label: "Sets & Gifts", blurb: "A journal with more than one mood." },
  { id: "refill", label: "Refills", blurb: "Fresh pages. Same cover." },
  { id: "accessory", label: "Accessories", blurb: "Spares and small things." },
];

export const MOODS: { id: string; label: string; feeling: string; color: string }[] = [
  { id: "focus", label: "Focus", feeling: "I need to think clearly", color: "#263859" },
  { id: "spark", label: "Spark", feeling: "I want to start something", color: "#C85A32" },
  { id: "rest", label: "Rest", feeling: "I want things to slow down", color: "#B9A88F" },
  { id: "authority", label: "Steady", feeling: "I need to feel grounded", color: "#2D4236" },
  { id: "tender", label: "Tender", feeling: "I want to feel things fully", color: "#C98CA7" },
];

export const CATEGORIES_CLIENT = CATEGORIES;
export const MOODS_CLIENT = MOODS;
