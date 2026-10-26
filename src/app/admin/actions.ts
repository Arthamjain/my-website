"use server";

import crypto from "node:crypto";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { all, db, get, run } from "@/lib/db";
import { adminBase, checkAdminCredentials, endAdminSession, requireAdmin, startAdminSession } from "@/lib/auth";
import { saveSettings } from "@/lib/settings";

export type AdminState = { ok?: boolean; error?: string; message?: string };

const s = (v: FormDataEntryValue | null, max = 2000) => String(v ?? "").trim().slice(0, max);
const n = (v: FormDataEntryValue | null) => {
  const x = Number(String(v ?? "").replace(/[^0-9.-]/g, ""));
  return Number.isFinite(x) ? Math.round(x) : 0;
};

/* ---------------------------------- session ---------------------------------- */

export async function adminLogin(_: AdminState, fd: FormData): Promise<AdminState> {
  const email = s(fd.get("email"), 200);
  const password = String(fd.get("password") ?? "");
  // Small fixed delay blunts password guessing.
  await new Promise((r) => setTimeout(r, 400));
  if (!checkAdminCredentials(email, password)) return { error: "Wrong email or password." };
  await startAdminSession(email);
  redirect(adminBase());
}

export async function adminLogout() {
  await endAdminSession();
  redirect(`${adminBase()}/login`);
}

/* ---------------------------------- products ---------------------------------- */

export type ProductInput = {
  id?: number;
  slug: string;
  title: string;
  subtitle: string;
  category: string;
  description: string;
  story: string;
  details: string[];
  care: string[];
  price: number;
  compare_at: number | null;
  status: string;
  featured: boolean;
  mood: string;
  color: string;
  color2: string;
  texture: string;
  maker: string;
  region: string;
  loom_hours: number;
  batch: string;
  tags: string;
  images: { url: string; alt: string }[];
  variants: { id?: number; title: string; format: string; ruling: string; sku: string; price: number | null; stock: number }[];
};

const slugify = (x: string) =>
  x
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export async function saveProduct(input: ProductInput): Promise<{ ok: boolean; error?: string; id?: number }> {
  await requireAdmin();
  const title = input.title?.trim();
  if (!title) return { ok: false, error: "Add a title." };
  if (!(input.price > 0)) return { ok: false, error: "Add a price greater than zero." };
  const slug = slugify(input.slug || title);
  if (!slug) return { ok: false, error: "Add a URL handle." };
  const clash = await get<{ id: number }>("SELECT id FROM products WHERE slug = ? AND id != ?", [slug, input.id ?? 0]);
  if (clash) return { ok: false, error: `Another product already uses /products/${slug}.` };
  const variants = (input.variants?.length ? input.variants : [{ title: "Default", format: "", ruling: "", sku: "", price: null, stock: 0 }]).map((v, i) => ({
    ...v,
    title: v.title?.trim() || [v.format, v.ruling].filter(Boolean).join(" · ") || `Option ${i + 1}`,
    stock: Math.max(0, Math.round(Number(v.stock) || 0)),
    price: v.price == null || String(v.price) === "" ? null : Math.max(0, Math.round(Number(v.price))),
  }));

  const client = await db();
  const tx = await client.transaction("write");
  try {
    const fields = [
      slug, title, input.subtitle ?? "", input.category || "journal", input.description ?? "", input.story ?? "",
      JSON.stringify((input.details ?? []).filter(Boolean)), JSON.stringify((input.care ?? []).filter(Boolean)),
      Math.round(input.price), input.compare_at ? Math.round(input.compare_at) : null, input.status || "draft", input.featured ? 1 : 0,
      input.mood ?? "", input.color || "#1C1917", input.color2 || "#FAF7F2", input.texture ?? "", input.maker ?? "", input.region ?? "",
      Math.max(0, Math.round(input.loom_hours || 0)), input.batch ?? "", input.tags ?? "",
    ];
    let id = input.id;
    if (id) {
      await tx.execute({
        sql: `UPDATE products SET slug=?, title=?, subtitle=?, category=?, description=?, story=?, details=?, care=?, price=?, compare_at=?, status=?, featured=?,
              mood=?, color=?, color2=?, texture=?, maker=?, region=?, loom_hours=?, batch=?, tags=?, updated_at=datetime('now') WHERE id=?`,
        args: [...fields, id],
      });
    } else {
      const r = await tx.execute({
        sql: `INSERT INTO products (slug, title, subtitle, category, description, story, details, care, price, compare_at, status, featured, mood, color, color2,
              texture, maker, region, loom_hours, batch, tags, sort) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?, 50)`,
        args: fields,
      });
      id = Number(r.lastInsertRowid);
    }
    await tx.execute({ sql: "DELETE FROM product_images WHERE product_id = ?", args: [id] });
    for (const [i, im] of (input.images ?? []).entries()) {
      if (!im.url) continue;
      await tx.execute({ sql: "INSERT INTO product_images (product_id, url, alt, position) VALUES (?,?,?,?)", args: [id, im.url, im.alt ?? "", i] });
    }
    // Keep variant ids stable so past orders and carts still resolve.
    const keep = variants.filter((v) => v.id).map((v) => v.id!);
    await tx.execute({
      sql: `DELETE FROM variants WHERE product_id = ? ${keep.length ? `AND id NOT IN (${keep.map(() => "?").join(",")})` : ""}`,
      args: [id, ...keep],
    });
    for (const [i, v] of variants.entries()) {
      if (v.id) {
        await tx.execute({
          sql: "UPDATE variants SET title=?, format=?, ruling=?, sku=?, price=?, stock=?, position=? WHERE id=? AND product_id=?",
          args: [v.title, v.format ?? "", v.ruling ?? "", v.sku ?? "", v.price, v.stock, i, v.id, id],
        });
      } else {
        await tx.execute({
          sql: "INSERT INTO variants (product_id, title, format, ruling, sku, price, stock, position) VALUES (?,?,?,?,?,?,?,?)",
          args: [id, v.title, v.format ?? "", v.ruling ?? "", v.sku ?? "", v.price, v.stock, i],
        });
      }
    }
    await tx.commit();
    revalidatePath("/", "layout");
    return { ok: true, id };
  } catch (e) {
    await tx.rollback();
    return { ok: false, error: `Couldn't save: ${(e as Error).message}` };
  } finally {
    tx.close();
  }
}

export async function deleteProduct(id: number) {
  await requireAdmin();
  const sold = await get("SELECT 1 FROM order_items WHERE product_id = ? LIMIT 1", [id]);
  if (sold) {
    // Products with order history are archived so old orders keep their references.
    await run("UPDATE products SET status = 'archived', updated_at = datetime('now') WHERE id = ?", [id]);
  } else {
    await run("DELETE FROM products WHERE id = ?", [id]);
  }
  revalidatePath("/", "layout");
  redirect(`${adminBase()}/products`);
}

export async function uploadImage(fd: FormData): Promise<{ ok: boolean; url?: string; error?: string }> {
  await requireAdmin();
  const file = fd.get("file");
  if (!(file instanceof File) || !file.size) return { ok: false, error: "Choose an image." };
  if (!/^image\/(jpeg|png|webp|avif|gif)$/.test(file.type)) return { ok: false, error: "Use a JPG, PNG, WebP or AVIF image." };
  if (file.size > 8 * 1024 * 1024) return { ok: false, error: "Images must be under 8 MB." };
  const buf = new Uint8Array(await file.arrayBuffer());
  const r = await run("INSERT INTO media (mime, data) VALUES (?, ?)", [file.type, buf]);
  return { ok: true, url: `/api/media/${r.id}` };
}

/* ---------------------------------- inventory ---------------------------------- */

export async function setStock(fd: FormData) {
  await requireAdmin();
  const id = n(fd.get("id"));
  const mode = s(fd.get("mode"), 10);
  const value = n(fd.get("value"));
  if (mode === "add") await run("UPDATE variants SET stock = MAX(0, stock + ?) WHERE id = ?", [value, id]);
  else await run("UPDATE variants SET stock = ? WHERE id = ?", [Math.max(0, value), id]);
  revalidatePath("/", "layout");
}

/* ---------------------------------- orders ---------------------------------- */

const event = (orderId: number, kind: string, message: string) =>
  run("INSERT INTO order_events (order_id, kind, message) VALUES (?,?,?)", [orderId, kind, message]);

async function restock(orderId: number) {
  const items = await all<{ variant_id: number | null; qty: number }>("SELECT variant_id, qty FROM order_items WHERE order_id = ?", [orderId]);
  for (const i of items) if (i.variant_id) await run("UPDATE variants SET stock = stock + ? WHERE id = ?", [i.qty, i.variant_id]);
}

export async function updateOrder(fd: FormData) {
  const admin = await requireAdmin();
  const id = n(fd.get("id"));
  const op = s(fd.get("op"), 20);
  const o = await get<{ id: number; status: string; payment_status: string; fulfillment_status: string; is_sample: number }>(
    "SELECT id, status, payment_status, fulfillment_status, is_sample FROM orders WHERE id = ?",
    [id],
  );
  if (!o) return;
  const who = admin.email || "Admin";
  switch (op) {
    case "packed":
      await run("UPDATE orders SET fulfillment_status = 'packed', updated_at = datetime('now') WHERE id = ?", [id]);
      await event(id, "fulfillment", `Marked as packed by ${who}.`);
      break;
    case "shipped": {
      const carrier = s(fd.get("carrier"), 60);
      const tracking = s(fd.get("tracking"), 80);
      await run("UPDATE orders SET fulfillment_status = 'shipped', carrier = ?, tracking_number = ?, updated_at = datetime('now') WHERE id = ?", [carrier, tracking, id]);
      await event(id, "fulfillment", `Shipped${carrier ? ` with ${carrier}` : ""}${tracking ? ` · tracking ${tracking}` : ""}.`);
      break;
    }
    case "delivered":
      await run("UPDATE orders SET fulfillment_status = 'delivered', updated_at = datetime('now') WHERE id = ?", [id]);
      await event(id, "fulfillment", "Marked as delivered.");
      break;
    case "paid":
      await run("UPDATE orders SET payment_status = 'paid', updated_at = datetime('now') WHERE id = ?", [id]);
      await event(id, "payment", "Payment marked as received.");
      break;
    case "refund":
      await run("UPDATE orders SET payment_status = 'refunded', updated_at = datetime('now') WHERE id = ?", [id]);
      if (fd.get("restock") && !o.is_sample) await restock(id);
      await event(id, "payment", `Refunded${fd.get("restock") ? " and items restocked" : ""}.`);
      break;
    case "cancel":
      if (o.status === "cancelled") break;
      await run("UPDATE orders SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?", [id]);
      if (!o.is_sample) await restock(id);
      await event(id, "status", "Order cancelled and items returned to stock.");
      break;
    case "reopen":
      await run("UPDATE orders SET status = 'open', updated_at = datetime('now') WHERE id = ?", [id]);
      await event(id, "status", "Order reopened. Check stock levels — cancelled items were restocked.");
      break;
    case "note": {
      const note = s(fd.get("note"), 1000);
      if (note) await event(id, "note", note);
      break;
    }
  }
  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin");
}

/* --------------------------------- discounts --------------------------------- */

export async function saveDiscount(_: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const code = s(fd.get("code"), 40).toUpperCase().replace(/\s+/g, "");
  const kind = s(fd.get("kind"), 10);
  const value = n(fd.get("value"));
  if (!/^[A-Z0-9_-]{3,40}$/.test(code)) return { error: "Codes use 3–40 letters, numbers, - or _." };
  if (!["percent", "fixed", "shipping"].includes(kind)) return { error: "Choose a discount type." };
  if (kind === "percent" && (value < 1 || value > 100)) return { error: "Percent must be between 1 and 100." };
  if (kind === "fixed" && value < 1) return { error: "Enter an amount off." };
  const limit = s(fd.get("usage_limit"), 10);
  const ends = s(fd.get("ends_at"), 20);
  try {
    await run("INSERT INTO discounts (code, kind, value, min_subtotal, usage_limit, ends_at) VALUES (?,?,?,?,?,?)", [
      code,
      kind,
      kind === "shipping" ? 0 : value,
      n(fd.get("min_subtotal")),
      limit ? n(limit) : null,
      ends ? `${ends}T23:59:59.000Z` : null,
    ]);
  } catch {
    return { error: "That code already exists." };
  }
  revalidatePath("/admin/discounts");
  return { ok: true, message: `${code} created.` };
}

export async function toggleDiscount(fd: FormData) {
  await requireAdmin();
  await run("UPDATE discounts SET active = 1 - active WHERE id = ?", [n(fd.get("id"))]);
  revalidatePath("/admin/discounts");
}

export async function deleteDiscount(fd: FormData) {
  await requireAdmin();
  await run("DELETE FROM discounts WHERE id = ?", [n(fd.get("id"))]);
  revalidatePath("/admin/discounts");
}

/* ------------------------------ reviews & messages ------------------------------ */

export async function moderateReview(fd: FormData) {
  await requireAdmin();
  const id = n(fd.get("id"));
  const op = s(fd.get("op"), 20);
  if (op === "delete") await run("DELETE FROM reviews WHERE id = ?", [id]);
  else await run("UPDATE reviews SET status = ? WHERE id = ?", [op === "publish" ? "published" : "hidden", id]);
  revalidatePath("/", "layout");
}

export async function setMessageStatus(fd: FormData) {
  await requireAdmin();
  const op = s(fd.get("op"), 20);
  if (op === "delete") await run("DELETE FROM messages WHERE id = ?", [n(fd.get("id"))]);
  else await run("UPDATE messages SET status = ? WHERE id = ?", [op === "done" ? "done" : "new", n(fd.get("id"))]);
  revalidatePath("/admin/messages");
}

/* ---------------------------------- settings ---------------------------------- */

export async function updateSettings(_: AdminState, fd: FormData): Promise<AdminState> {
  await requireAdmin();
  const values: Record<string, string> = {};
  for (const k of ["store_name", "support_email", "support_phone", "announcement"]) values[k] = s(fd.get(k), 300);
  for (const k of ["free_shipping_threshold", "standard_shipping", "express_shipping", "cod_fee", "gst_rate"]) values[k] = String(Math.max(0, n(fd.get(k))));
  values.cod_enabled = fd.get("cod_enabled") ? "1" : "0";
  await saveSettings(values);
  revalidatePath("/", "layout");
  return { ok: true, message: "Settings saved." };
}

/* --------------------------------- sample data --------------------------------- */

const FIRST = ["Aanya", "Rohan", "Meera", "Kabir", "Ishita", "Arjun", "Naina", "Vivaan", "Tara", "Dev", "Zoya", "Neil", "Riya", "Sameer", "Lila", "Omar"];
const LAST = ["Sharma", "Iyer", "Banerjee", "Khan", "Mehta", "Reddy", "Kapoor", "Das", "Nair", "Joshi", "Bose", "Gill"];
const CITIES: [string, string, string][] = [
  ["Mumbai", "Maharashtra", "400050"], ["Bengaluru", "Karnataka", "560034"], ["New Delhi", "Delhi", "110017"], ["Pune", "Maharashtra", "411001"],
  ["Kolkata", "West Bengal", "700019"], ["Chennai", "Tamil Nadu", "600040"], ["Jaipur", "Rajasthan", "302001"], ["Hyderabad", "Telangana", "500033"],
  ["Ahmedabad", "Gujarat", "380009"], ["Kochi", "Kerala", "682020"],
];
const REFERRERS = ["", "", "", "instagram.com", "google.com", "google.com", "pinterest.com", "facebook.com"];
const PAGES = ["/", "/", "/shop", "/story", "/makers", "/journal", "/shop?category=cover", "/help"];

export async function loadSampleData(): Promise<AdminState> {
  await requireAdmin();
  const already = await get<{ n: number }>("SELECT COUNT(*) AS n FROM orders WHERE is_sample = 1");
  if (Number(already?.n) > 0) return { error: "Sample data is already loaded. Remove it first to regenerate." };

  const variants = await all<{ id: number; product_id: number; title: string; vtitle: string; sku: string; price: number; image: string; category: string }>(
    `SELECT v.id, v.product_id, p.title, v.title AS vtitle, v.sku, COALESCE(v.price, p.price) AS price, p.category,
       COALESCE((SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY position LIMIT 1), '') AS image
     FROM variants v JOIN products p ON p.id = v.product_id WHERE p.status = 'active'`,
  );
  if (!variants.length) return { error: "Add some products first." };
  let seed = 42;
  const rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  const pick = <T,>(a: T[]) => a[Math.floor(rnd() * a.length)];
  const weighted = variants.flatMap((v) => (v.category === "journal" ? [v, v, v] : v.category === "set" ? [v, v] : [v]));
  const ts = (daysAgo: number) => {
    const d = new Date(Date.now() - daysAgo * 864e5 - rnd() * 864e5 * 0.9);
    return d.toISOString().replace("T", " ").slice(0, 19);
  };

  const client = await db();
  const tx = await client.transaction("write");
  try {
    const custIds: { id: number; email: string; name: string }[] = [];
    for (let i = 0; i < 38; i++) {
      const name = `${pick(FIRST)} ${pick(LAST)}`;
      const email = `${name.toLowerCase().replace(/\s+/g, ".")}.${i}@example.com`;
      const r = await tx.execute({ sql: "INSERT INTO customers (email, name, phone, is_sample, created_at) VALUES (?,?,?,1,?)", args: [email, name, `98${String(10000000 + i * 7919).slice(0, 8)}`, ts(30 + rnd() * 30)] });
      custIds.push({ id: Number(r.lastInsertRowid), email, name });
    }
    let orderNo = 9001;
    for (let day = 59; day >= 0; day--) {
      const visits = Math.round(40 + rnd() * 50 + (59 - day) * 0.9);
      for (let v = 0; v < visits; v++) {
        const sid = `sample-${day}-${v}`;
        const when = ts(day);
        const device = rnd() < 0.68 ? "Mobile" : rnd() < 0.9 ? "Desktop" : "Tablet";
        const ref = pick(REFERRERS);
        await tx.execute({ sql: "INSERT INTO events (session_id, kind, path, referrer, device, is_sample, created_at) VALUES (?,?,?,?,?,1,?)", args: [sid, "page_view", pick(PAGES), ref, device, when] });
        if (rnd() < 0.55) {
          const pv = pick(weighted);
          await tx.execute({ sql: "INSERT INTO events (session_id, kind, path, product_id, device, is_sample, created_at) VALUES (?,?,?,?,?,1,?)", args: [sid, "product_view", "/products", pv.product_id, device, when] });
          if (rnd() < 0.22) {
            await tx.execute({ sql: "INSERT INTO events (session_id, kind, path, product_id, value, device, is_sample, created_at) VALUES (?,?,?,?,?,?,1,?)", args: [sid, "add_to_cart", "/products", pv.product_id, pv.price, device, when] });
            if (rnd() < 0.55) {
              await tx.execute({ sql: "INSERT INTO events (session_id, kind, path, device, is_sample, created_at) VALUES (?,?,?,?,1,?)", args: [sid, "begin_checkout", "/checkout", device, when] });
              if (rnd() < 0.5) {
                const c = pick(custIds);
                const lines = Array.from({ length: rnd() < 0.75 ? 1 : 2 }, () => pick(weighted));
                const subtotal = lines.reduce((a, l) => a + l.price, 0);
                const shipping = subtotal >= 1500 ? 0 : 99;
                const payment = rnd() < 0.35 ? "cod" : rnd() < 0.7 ? "upi" : "card";
                const cod = payment === "cod" ? 49 : 0;
                const total = subtotal + shipping + cod;
                const age = day;
                const fulfil = age > 6 ? "delivered" : age > 3 ? "shipped" : age > 1 ? "packed" : "unfulfilled";
                const status = rnd() < 0.04 ? "cancelled" : "open";
                const paid = payment !== "cod" || fulfil === "delivered";
                const [city, state, pin] = pick(CITIES);
                const o = await tx.execute({
                  sql: `INSERT INTO orders (number, token, customer_id, email, name, phone, address, subtotal, shipping, cod_fee, tax, total, payment_method, payment_status,
                        fulfillment_status, status, carrier, tracking_number, is_sample, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,1,?,?)`,
                  args: [
                    `KY${orderNo++}`, crypto.randomBytes(8).toString("hex"), c.id, c.email, c.name, "9800000000",
                    JSON.stringify({ line1: `${Math.ceil(rnd() * 200)}, Sample Street`, line2: "", city, state, pincode: pin, country: "India" }),
                    subtotal, shipping, cod, Math.round((total * 12) / 112), total, payment, paid ? "paid" : "pending", fulfil, status,
                    ["shipped", "delivered"].includes(fulfil) ? "Delhivery" : "", ["shipped", "delivered"].includes(fulfil) ? `SAMPLE${orderNo}` : "", when, when,
                  ],
                });
                const oid = Number(o.lastInsertRowid);
                for (const l of lines) {
                  await tx.execute({
                    sql: "INSERT INTO order_items (order_id, product_id, variant_id, title, variant_title, sku, image, price, qty) VALUES (?,?,?,?,?,?,?,?,1)",
                    args: [oid, l.product_id, l.id, l.title, l.vtitle, l.sku, l.image, l.price],
                  });
                }
                await tx.execute({ sql: "INSERT INTO order_events (order_id, kind, message, created_at) VALUES (?,?,?,?)", args: [oid, "placed", "Sample order generated for testing.", when] });
              }
            }
          }
        }
      }
    }
    await tx.commit();
  } catch (e) {
    await tx.rollback();
    return { error: `Couldn't load sample data: ${(e as Error).message}` };
  } finally {
    tx.close();
  }
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Sample orders, customers and traffic for the last 60 days are loaded. They're labelled SAMPLE and don't touch your stock." };
}

export async function removeSampleData(): Promise<AdminState> {
  await requireAdmin();
  await run("DELETE FROM order_items WHERE order_id IN (SELECT id FROM orders WHERE is_sample = 1)");
  await run("DELETE FROM order_events WHERE order_id IN (SELECT id FROM orders WHERE is_sample = 1)");
  await run("DELETE FROM orders WHERE is_sample = 1");
  await run("DELETE FROM events WHERE is_sample = 1");
  await run("DELETE FROM customers WHERE is_sample = 1 AND id NOT IN (SELECT customer_id FROM orders WHERE customer_id IS NOT NULL)");
  revalidatePath("/admin", "layout");
  return { ok: true, message: "Sample data removed." };
}
