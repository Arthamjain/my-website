import { notFound } from "next/navigation";
import ProductEditor from "@/components/admin/ProductEditor";
import { adminBase } from "@/lib/auth";
import { getProductById, parseList } from "@/lib/catalog";

export default async function EditProduct({ params }: PageProps<"/admin/products/[id]">) {
  const { id } = await params;
  const p = await getProductById(Number(id));
  if (!p) notFound();
  return (
    <ProductEditor
      base={adminBase()}
      initial={{
        id: p.id,
        slug: p.slug,
        title: p.title,
        subtitle: p.subtitle,
        category: p.category,
        description: p.description,
        story: p.story,
        details: parseList(p.details),
        care: parseList(p.care),
        price: p.price,
        compare_at: p.compare_at,
        status: p.status,
        featured: !!p.featured,
        mood: p.mood,
        color: p.color,
        color2: p.color2,
        texture: p.texture,
        maker: p.maker,
        region: p.region,
        loom_hours: p.loom_hours,
        batch: p.batch,
        tags: p.tags,
        images: p.images.map((i) => ({ url: i.url, alt: i.alt })),
        variants: p.variants.map((v) => ({ id: v.id, title: v.title, format: v.format, ruling: v.ruling, sku: v.sku, price: v.price, stock: v.stock })),
      }}
    />
  );
}
