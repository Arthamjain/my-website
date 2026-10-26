"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, ImagePlus, Plus, Trash2 } from "lucide-react";
import { deleteProduct, saveProduct, uploadImage, type ProductInput } from "@/app/admin/actions";
import { CATEGORIES_CLIENT, MOODS_CLIENT } from "@/lib/catalog-shared";
import { Card, btnDanger, btnPrimary, btnSecondary, field, fieldLabel } from "./ui";

const EMPTY: ProductInput = {
  slug: "",
  title: "",
  subtitle: "",
  category: "journal",
  description: "",
  story: "",
  details: [],
  care: [],
  price: 0,
  compare_at: null,
  status: "draft",
  featured: false,
  mood: "",
  color: "#263859",
  color2: "#FAF7F2",
  texture: "",
  maker: "",
  region: "",
  loom_hours: 0,
  batch: "",
  tags: "",
  images: [],
  variants: [{ title: "Default", format: "", ruling: "", sku: "", price: null, stock: 0 }],
};

export default function ProductEditor({ base, initial }: { base: string; initial?: ProductInput }) {
  const [p, setP] = useState<ProductInput>(initial ?? EMPTY);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [pending, start] = useTransition();
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const set = <K extends keyof ProductInput>(k: K, v: ProductInput[K]) => {
    setSaved(false);
    setP((s) => ({ ...s, [k]: v }));
  };
  const setVariant = (i: number, patch: Partial<ProductInput["variants"][number]>) =>
    set(
      "variants",
      p.variants.map((v, j) => (j === i ? { ...v, ...patch } : v)),
    );

  const save = () => {
    setError("");
    start(async () => {
      const res = await saveProduct(p);
      if (!res.ok) return setError(res.error ?? "Couldn't save.");
      setSaved(true);
      if (!p.id && res.id) router.replace(`${base}/products/${res.id}`);
      else router.refresh();
    });
  };

  const onFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    setUploading(true);
    setError("");
    const added: { url: string; alt: string }[] = [];
    for (const f of Array.from(files)) {
      const fd = new FormData();
      fd.append("file", f);
      const r = await uploadImage(fd);
      if (r.ok && r.url) added.push({ url: r.url, alt: p.title });
      else setError(r.error ?? "Upload failed.");
    }
    set("images", [...p.images, ...added]);
    setUploading(false);
    if (fileRef.current) fileRef.current.value = "";
  };

  const moveImage = (i: number, d: -1 | 1) => {
    const next = [...p.images];
    const j = i + d;
    if (j < 0 || j >= next.length) return;
    [next[i], next[j]] = [next[j], next[i]];
    set("images", next);
  };

  const totalStock = p.variants.reduce((n, v) => n + (Number(v.stock) || 0), 0);

  return (
    <div className="mx-auto max-w-[1100px] pb-24">
      <Link href={`${base}/products`} className="mb-3 inline-flex items-center gap-1 text-[13px] text-muted hover:text-ink">
        <ArrowLeft size={14} /> Products
      </Link>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[24px] font-semibold tracking-tight">{p.id ? p.title || "Untitled" : "Add product"}</h1>
        {p.id && p.status === "active" && (
          <a href={`/products/${p.slug}`} target="_blank" className={btnSecondary}>
            <ExternalLink size={14} /> View in store
          </a>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-4">
          <Card>
            <div className="grid gap-4">
              <label>
                <span className={fieldLabel}>Title</span>
                <input value={p.title} onChange={(e) => set("title", e.target.value)} className={field} placeholder="Indigo Dabu Journal" />
              </label>
              <label>
                <span className={fieldLabel}>Subtitle — one line under the title</span>
                <input value={p.subtitle} onChange={(e) => set("subtitle", e.target.value)} className={field} />
              </label>
              <label>
                <span className={fieldLabel}>Description</span>
                <textarea rows={5} value={p.description} onChange={(e) => set("description", e.target.value)} className={field} />
              </label>
              <label>
                <span className={fieldLabel}>How it&apos;s made (story section)</span>
                <textarea rows={4} value={p.story} onChange={(e) => set("story", e.target.value)} className={field} />
              </label>
            </div>
          </Card>

          <Card title="Photos" action={<span className="text-[12px] text-muted">First photo is the main one</span>}>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {p.images.map((im, i) => (
                <div key={im.url + i} className="group relative aspect-[4/5] overflow-hidden rounded-lg border border-black/10 bg-[#F1ECE3]">
                  <Image src={im.url} alt={im.alt} fill sizes="160px" className="object-contain" />
                  {i === 0 && <span className="absolute left-1.5 top-1.5 rounded bg-ink px-1.5 py-0.5 text-[10px] text-white">Main</span>}
                  <div className="absolute inset-x-0 bottom-0 flex justify-between bg-white/90 p-1 opacity-0 transition group-hover:opacity-100">
                    <span className="flex">
                      <button type="button" onClick={() => moveImage(i, -1)} className="p-1" aria-label="Move earlier">
                        <ArrowUp size={14} className="-rotate-90" />
                      </button>
                      <button type="button" onClick={() => moveImage(i, 1)} className="p-1" aria-label="Move later">
                        <ArrowDown size={14} className="-rotate-90" />
                      </button>
                    </span>
                    <button type="button" onClick={() => set("images", p.images.filter((_, j) => j !== i))} className="p-1 text-bad" aria-label="Remove photo">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="grid aspect-[4/5] place-items-center rounded-lg border border-dashed border-black/20 text-[12.5px] text-muted hover:border-ink hover:text-ink"
              >
                <span className="flex flex-col items-center gap-1">
                  <ImagePlus size={20} />
                  {uploading ? "Uploading…" : "Add photos"}
                </span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" multiple hidden onChange={(e) => onFiles(e.target.files)} />
            </div>
            <details className="mt-4 text-[13px]">
              <summary className="cursor-pointer text-muted">Add by URL or path instead</summary>
              <form
                className="mt-2 flex gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  const url = String(new FormData(e.currentTarget).get("url") ?? "").trim();
                  if (url) set("images", [...p.images, { url, alt: p.title }]);
                  e.currentTarget.reset();
                }}
              >
                <input name="url" placeholder="/images/renders/dabu-hero.webp" className={field} />
                <button className={btnSecondary}>Add</button>
              </form>
            </details>
          </Card>

          <Card title="Pricing">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className={fieldLabel}>Price (₹, incl. GST)</span>
                <input type="number" min={0} value={p.price || ""} onChange={(e) => set("price", Number(e.target.value))} className={field} />
              </label>
              <label>
                <span className={fieldLabel}>Compare-at price (shows as a saving)</span>
                <input type="number" min={0} value={p.compare_at ?? ""} onChange={(e) => set("compare_at", e.target.value ? Number(e.target.value) : null)} className={field} />
              </label>
            </div>
          </Card>

          <Card title={`Variants & inventory · ${totalStock} in stock`}>
            <p className="mb-3 text-[12.5px] text-muted">
              Leave a variant&apos;s price empty to use the product price. Size and pages become the options shoppers choose from.
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-[13px]">
                <thead className="text-left text-[12px] text-muted">
                  <tr>
                    <th className="pb-2 font-medium">Size</th>
                    <th className="pb-2 font-medium">Pages</th>
                    <th className="pb-2 font-medium">SKU</th>
                    <th className="pb-2 font-medium">Price</th>
                    <th className="pb-2 font-medium">Stock</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {p.variants.map((v, i) => (
                    <tr key={v.id ?? `new-${i}`}>
                      <td className="py-1 pr-2">
                        <input value={v.format} onChange={(e) => setVariant(i, { format: e.target.value, title: [e.target.value, v.ruling].filter(Boolean).join(" · ") })} placeholder="A5" className={field} />
                      </td>
                      <td className="py-1 pr-2">
                        <input value={v.ruling} onChange={(e) => setVariant(i, { ruling: e.target.value, title: [v.format, e.target.value].filter(Boolean).join(" · ") })} placeholder="Dot grid" className={field} />
                      </td>
                      <td className="py-1 pr-2">
                        <input value={v.sku} onChange={(e) => setVariant(i, { sku: e.target.value })} className={field} />
                      </td>
                      <td className="w-28 py-1 pr-2">
                        <input type="number" min={0} value={v.price ?? ""} placeholder={String(p.price || "")} onChange={(e) => setVariant(i, { price: e.target.value === "" ? null : Number(e.target.value) })} className={field} />
                      </td>
                      <td className="w-24 py-1 pr-2">
                        <input type="number" min={0} value={v.stock} onChange={(e) => setVariant(i, { stock: Number(e.target.value) })} className={field} />
                      </td>
                      <td className="py-1">
                        <button
                          type="button"
                          disabled={p.variants.length === 1}
                          onClick={() => set("variants", p.variants.filter((_, j) => j !== i))}
                          className="p-2 text-muted hover:text-bad disabled:opacity-30"
                          aria-label="Remove variant"
                        >
                          <Trash2 size={15} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <button type="button" onClick={() => set("variants", [...p.variants, { title: "", format: "", ruling: "", sku: "", price: null, stock: 0 }])} className={`${btnSecondary} mt-3`}>
              <Plus size={14} /> Add variant
            </button>
          </Card>

          <Card title="Details & care">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className={fieldLabel}>What you get — one per line</span>
                <textarea rows={6} value={p.details.join("\n")} onChange={(e) => set("details", e.target.value.split("\n"))} className={field} />
              </label>
              <label>
                <span className={fieldLabel}>Care — one per line</span>
                <textarea rows={6} value={p.care.join("\n")} onChange={(e) => set("care", e.target.value.split("\n"))} className={field} />
              </label>
            </div>
          </Card>
        </div>

        <div className="space-y-4">
          <Card title="Status">
            <select value={p.status} onChange={(e) => set("status", e.target.value)} className={field}>
              <option value="active">Active — visible in the store</option>
              <option value="draft">Draft — hidden</option>
              <option value="archived">Archived</option>
            </select>
            <label className="mt-3 flex items-center gap-2 text-[13.5px]">
              <input type="checkbox" checked={p.featured} onChange={(e) => set("featured", e.target.checked)} /> Feature on the home page
            </label>
          </Card>
          <Card title="Organisation">
            <div className="grid gap-3">
              <label>
                <span className={fieldLabel}>Category</span>
                <select value={p.category} onChange={(e) => set("category", e.target.value)} className={field}>
                  {CATEGORIES_CLIENT.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={fieldLabel}>Mood</span>
                <select value={p.mood} onChange={(e) => set("mood", e.target.value)} className={field}>
                  <option value="">None</option>
                  {MOODS_CLIENT.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className={fieldLabel}>Tags (comma separated, used in search)</span>
                <input value={p.tags} onChange={(e) => set("tags", e.target.value)} className={field} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className={fieldLabel}>Main colour</span>
                  <input type="color" value={p.color} onChange={(e) => set("color", e.target.value)} className="h-10 w-full rounded-lg border border-black/10" />
                </label>
                <label>
                  <span className={fieldLabel}>Accent</span>
                  <input type="color" value={p.color2} onChange={(e) => set("color2", e.target.value)} className="h-10 w-full rounded-lg border border-black/10" />
                </label>
              </div>
            </div>
          </Card>
          <Card title="Provenance">
            <div className="grid gap-3">
              <label>
                <span className={fieldLabel}>Made by</span>
                <input value={p.maker} onChange={(e) => set("maker", e.target.value)} className={field} />
              </label>
              <label>
                <span className={fieldLabel}>Region</span>
                <input value={p.region} onChange={(e) => set("region", e.target.value)} className={field} />
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label>
                  <span className={fieldLabel}>Hand hours</span>
                  <input type="number" min={0} value={p.loom_hours} onChange={(e) => set("loom_hours", Number(e.target.value))} className={field} />
                </label>
                <label>
                  <span className={fieldLabel}>Batch</span>
                  <input value={p.batch} onChange={(e) => set("batch", e.target.value)} className={field} placeholder="Batch 04 of 50" />
                </label>
              </div>
              <label>
                <span className={fieldLabel}>Fabric close-up image path</span>
                <input value={p.texture} onChange={(e) => set("texture", e.target.value)} className={field} />
              </label>
            </div>
          </Card>
          <Card title="Search engine listing">
            <label>
              <span className={fieldLabel}>URL handle</span>
              <div className="flex items-center rounded-lg border border-black/10 bg-white pl-3 text-[13px] text-muted focus-within:border-ink">
                /products/
                <input value={p.slug} onChange={(e) => set("slug", e.target.value)} placeholder="auto from title" className="w-full rounded-lg bg-transparent px-1 py-2 text-ink outline-none" />
              </div>
            </label>
          </Card>
          {p.id && (
            <Card title="Danger zone">
              <form
                action={async () => {
                  if (confirm("Delete this product? Products with past orders are archived instead.")) await deleteProduct(p.id!);
                }}
              >
                <button className={btnDanger}>
                  <Trash2 size={14} /> Delete product
                </button>
              </form>
            </Card>
          )}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-black/[0.07] bg-white/95 backdrop-blur lg:left-60">
        <div className="mx-auto flex max-w-[1100px] items-center justify-end gap-3 px-4 py-3 md:px-8">
          {error && <p className="mr-auto text-[13px] text-bad">{error}</p>}
          {saved && !error && <p className="mr-auto text-[13px] text-ok">Saved.</p>}
          <Link href={`${base}/products`} className={btnSecondary}>
            Cancel
          </Link>
          <button onClick={save} disabled={pending || uploading} className={btnPrimary}>
            {pending ? "Saving…" : "Save product"}
          </button>
        </div>
      </div>
    </div>
  );
}
