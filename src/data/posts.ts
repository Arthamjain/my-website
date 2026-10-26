export type Post = {
  slug: string;
  title: string;
  dek: string;
  image: string;
  date: string;
  readMins: number;
  body: string[];
};

export const posts: Post[] = [
  {
    slug: "why-we-chose-a-brass-spine",
    title: "Why we chose a brass spine",
    dek: "Most notebooks are designed to be thrown away. We wanted the opposite.",
    image: "/images/fountain-script.jpg",
    date: "2026-09-12",
    readMins: 4,
    body: [
      "The first prototype had an elastic band and a stitched spine, like almost every good notebook you have owned. It was lovely for about three months. Then the pages ran out, and the whole thing — cover, board, band — went into a drawer with the others.",
      "We kept asking the same question: what if the part you love could stay, and only the paper changed? That is where the rod came from. A single length of solid brass runs through the spine. Lift it, and the text block slides out. Drop a new one in, and the rod clicks home.",
      "Brass was not the cheapest choice. Plated steel would have been lighter and a third of the price. But brass gets better as you handle it — it darkens where your thumb rests and brightens where it rubs against the desk. After a year, your rod looks like yours.",
      "The rods are turned in a small workshop in Moradabad, a town that has worked brass for longer than anyone can say exactly. Each one is finished by hand, which is why no two have quite the same sheen.",
    ],
  },
  {
    slug: "a-morning-in-bagru",
    title: "A morning in Bagru",
    dek: "Mud, indigo and very patient hands: how a dabu cover is printed.",
    image: "/images/fabric/tex-dabu.jpg",
    date: "2026-08-28",
    readMins: 5,
    body: [
      "By eight in the morning the printing tables are already damp. The paste for dabu is a mix of black clay, lime, gum and wheat husk, and it has to be just wet enough to take from the block cleanly.",
      "A printer presses the carved block into the paste, lines it up by eye, and brings it down on the cloth with the heel of the hand. Then the next impression, and the next. The rhythm is fast and the eye is never wrong for long — but it is never machine-perfect either, and that is the point.",
      "Sawdust is scattered over the wet paste so it does not smudge, and the cloth dries in the sun. Only then does it go into the indigo vat. The clay resists the dye, so when it is washed away the pattern appears in pale relief, with soft, slightly cracked edges.",
      "One cover takes about eighteen hours of work if you count every dip and every dry. We think you can feel that when you hold it.",
    ],
  },
  {
    slug: "how-to-keep-a-mood-journal",
    title: "How to keep a journal you actually return to",
    dek: "Five small habits that keep a notebook open on the desk instead of shut in a drawer.",
    image: "/images/hands-writing.jpg",
    date: "2026-08-02",
    readMins: 3,
    body: [
      "Write the date first, always. It sounds trivial, but a dated page feels like a commitment, and in a year's time it is the first thing you will look for.",
      "Give yourself permission to write badly. A journal is not a performance. Half-sentences, lists, arrows and crossings-out are all welcome.",
      "Keep it where you sit, not where you store things. If it lives on the desk, open, it gets used. If it lives in a drawer, it becomes a lovely object you feel guilty about.",
      "Change the cover when the season of your life changes. Try indigo before exams or launches, and raw tussar on holidays. It is a small ritual, but it marks the shift.",
      "And when a book is full, write one last page: what this stretch of time was about. Future you will be grateful.",
    ],
  },
];
