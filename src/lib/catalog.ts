import "server-only";
import { all, get } from "./db";

export type Product = {
  id: number;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  story: string;
  details: string;
  care: string;
  price: number;
  compare_at: number | null;
  status: string;
  featured: number;
  mood: string;
  color: string;
  color2: string;
  texture: string;
  maker: string;
  region: string;
  loom_hours: number;
  batch: string;
  tags: string;
  sort: number;
  created_at: string;
};

export type Variant = {
  id: number;
  product_id: number;
  title: string;
  format: string;
  ruling: string;
  sku: string;
  price: number | null;
  stock: number;
  position: number;
};

export type ProductImage = { id: number; product_id: number; url: string; alt: string; position: number };

export type ProductCard = Product & { image: string; image2: string; stock: number; rating: number | null; reviews: number };

export { CATEGORIES, MOODS } from "./catalog-shared";

const CARD_SQL = `
  SELECT p.*,
    COALESCE((SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY position LIMIT 1), '') AS image,
    COALESCE((SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY position LIMIT 1 OFFSET 1), '') AS image2,
    COALESCE((SELECT SUM(stock) FROM variants v WHERE v.product_id = p.id), 0) AS stock,
    (SELECT ROUND(AVG(rating), 1) FROM reviews r WHERE r.product_id = p.id AND r.status = 'published') AS rating,
    (SELECT COUNT(*) FROM reviews r WHERE r.product_id = p.id AND r.status = 'published') AS reviews
  FROM products p`;

export type ShopQuery = { category?: string; mood?: string; sort?: string; q?: string; featured?: boolean; limit?: number };

export async function listProducts(opts: ShopQuery = {}) {
  const where = ["p.status = 'active'"];
  const args: (string | number)[] = [];
  if (opts.category) {
    where.push("p.category = ?");
    args.push(opts.category);
  }
  if (opts.mood) {
    where.push("p.mood = ?");
    args.push(opts.mood);
  }
  if (opts.featured) where.push("p.featured = 1");
  if (opts.q) {
    where.push("(p.title LIKE ? OR p.subtitle LIKE ? OR p.tags LIKE ? OR p.region LIKE ? OR p.description LIKE ?)");
    const like = `%${opts.q}%`;
    args.push(like, like, like, like, like);
  }
  const order =
    opts.sort === "price-asc"
      ? "p.price ASC"
      : opts.sort === "price-desc"
        ? "p.price DESC"
        : opts.sort === "new"
          ? "p.created_at DESC, p.id DESC"
          : "p.featured DESC, p.sort ASC, p.id ASC";
  return all<ProductCard>(`${CARD_SQL} WHERE ${where.join(" AND ")} ORDER BY ${order} LIMIT ${Math.min(opts.limit ?? 60, 200)}`, args);
}

export async function getProductBySlug(slug: string, includeDrafts = false) {
  const p = await get<Product>(`SELECT * FROM products WHERE slug = ? ${includeDrafts ? "" : "AND status = 'active'"}`, [slug]);
  if (!p) return null;
  return withRelations(p);
}

export async function getProductById(id: number) {
  const p = await get<Product>("SELECT * FROM products WHERE id = ?", [id]);
  if (!p) return null;
  return withRelations(p);
}

async function withRelations(p: Product) {
  const [images, variants] = await Promise.all([
    all<ProductImage>("SELECT * FROM product_images WHERE product_id = ? ORDER BY position, id", [p.id]),
    all<Variant>("SELECT * FROM variants WHERE product_id = ? ORDER BY position, id", [p.id]),
  ]);
  return { ...p, images, variants };
}

export type ProductFull = NonNullable<Awaited<ReturnType<typeof getProductBySlug>>>;

export async function getRelated(p: Product, limit = 4) {
  return all<ProductCard>(
    `${CARD_SQL} WHERE p.status = 'active' AND p.id != ? ORDER BY (p.mood = ?) DESC, (p.category = ?) DESC, p.featured DESC, p.sort LIMIT ?`,
    [p.id, p.mood, p.category, limit],
  );
}

export type Review = {
  id: number;
  product_id: number;
  name: string;
  location: string;
  rating: number;
  title: string;
  body: string;
  status: string;
  verified: number;
  created_at: string;
};

export async function getReviews(productId: number) {
  return all<Review>("SELECT * FROM reviews WHERE product_id = ? AND status = 'published' ORDER BY created_at DESC", [productId]);
}

export const parseList = (s: string): string[] => {
  try {
    const v = JSON.parse(s);
    return Array.isArray(v) ? v.map(String) : [];
  } catch {
    return s ? s.split("\n").filter(Boolean) : [];
  }
};

export const variantPrice = (p: { price: number }, v: { price: number | null } | undefined) => v?.price ?? p.price;
