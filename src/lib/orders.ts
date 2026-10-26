import "server-only";
import crypto from "node:crypto";
import { all, db, get, run } from "./db";
import { getSettings } from "./settings";

export type CartLine = { variantId: number; qty: number };

export type QuoteLine = {
  productId: number;
  variantId: number;
  slug: string;
  title: string;
  variantTitle: string;
  sku: string;
  image: string;
  price: number;
  qty: number;
  stock: number;
  lineTotal: number;
};

export type Quote = {
  lines: QuoteLine[];
  subtotal: number;
  discount: number;
  discountCode: string;
  discountError: string;
  shipping: number;
  codFee: number;
  total: number;
  tax: number;
  freeShippingThreshold: number;
  problems: string[];
};

type Discount = {
  id: number;
  code: string;
  kind: "percent" | "fixed" | "shipping";
  value: number;
  min_subtotal: number;
  usage_limit: number | null;
  used: number;
  ends_at: string | null;
  active: number;
};

export async function findDiscount(code: string) {
  if (!code) return null;
  return (await get<Discount>("SELECT * FROM discounts WHERE code = ? COLLATE NOCASE", [code.trim()])) ?? null;
}

export async function quote(
  cart: CartLine[],
  opts: { code?: string; shippingMethod?: string; payment?: string } = {},
): Promise<Quote> {
  const settings = await getSettings();
  const ids = [...new Set(cart.map((c) => Number(c.variantId)).filter(Boolean))];
  const rows = ids.length
    ? await all<{
        vid: number;
        pid: number;
        slug: string;
        title: string;
        vtitle: string;
        sku: string;
        vprice: number | null;
        pprice: number;
        stock: number;
        status: string;
        image: string;
      }>(
        `SELECT v.id AS vid, p.id AS pid, p.slug, p.title, v.title AS vtitle, v.sku, v.price AS vprice, p.price AS pprice, v.stock, p.status,
           COALESCE((SELECT url FROM product_images i WHERE i.product_id = p.id ORDER BY position LIMIT 1), '') AS image
         FROM variants v JOIN products p ON p.id = v.product_id WHERE v.id IN (${ids.map(() => "?").join(",")})`,
        ids,
      )
    : [];
  const byId = new Map(rows.map((r) => [r.vid, r]));
  const problems: string[] = [];
  const lines: QuoteLine[] = [];
  for (const c of cart) {
    const r = byId.get(Number(c.variantId));
    if (!r || r.status !== "active") {
      problems.push("An item in your bag is no longer available and was removed.");
      continue;
    }
    let qty = Math.max(1, Math.min(10, Math.floor(Number(c.qty) || 1)));
    if (r.stock <= 0) {
      problems.push(`${r.title} (${r.vtitle}) has just sold out.`);
      continue;
    }
    if (qty > r.stock) {
      problems.push(`Only ${r.stock} left of ${r.title} (${r.vtitle}) — we've adjusted your bag.`);
      qty = r.stock;
    }
    const price = r.vprice ?? r.pprice;
    lines.push({
      productId: r.pid,
      variantId: r.vid,
      slug: r.slug,
      title: r.title,
      variantTitle: r.vtitle,
      sku: r.sku,
      image: r.image,
      price,
      qty,
      stock: r.stock,
      lineTotal: price * qty,
    });
  }
  const subtotal = lines.reduce((s, l) => s + l.lineTotal, 0);

  let discount = 0;
  let discountError = "";
  let discountCode = "";
  let freeShipFromCode = false;
  if (opts.code) {
    const d = await findDiscount(opts.code);
    const now = new Date().toISOString();
    if (!d || !d.active) discountError = "That code isn't valid.";
    else if (d.ends_at && d.ends_at < now) discountError = "That code has expired.";
    else if (d.usage_limit != null && d.used >= d.usage_limit) discountError = "That code has been fully used.";
    else if (subtotal < d.min_subtotal) discountError = `Spend ₹${d.min_subtotal.toLocaleString("en-IN")} to use this code.`;
    else {
      discountCode = d.code;
      if (d.kind === "percent") discount = Math.round((subtotal * Math.min(100, d.value)) / 100);
      else if (d.kind === "fixed") discount = Math.min(subtotal, d.value);
      else freeShipFromCode = true;
    }
  }

  const after = subtotal - discount;
  const express = opts.shippingMethod === "express";
  let shipping = 0;
  if (lines.length) {
    if (express) shipping = settings.express_shipping;
    else if (!freeShipFromCode && after < settings.free_shipping_threshold) shipping = settings.standard_shipping;
  }
  const codFee = opts.payment === "cod" && lines.length ? settings.cod_fee : 0;
  const total = after + shipping + codFee;
  const tax = Math.round((total * settings.gst_rate) / (100 + settings.gst_rate));
  return {
    lines,
    subtotal,
    discount,
    discountCode,
    discountError,
    shipping,
    codFee,
    total,
    tax,
    freeShippingThreshold: settings.free_shipping_threshold,
    problems,
  };
}

export type Address = { line1: string; line2: string; city: string; state: string; pincode: string; country: string };

export type PlaceOrderInput = {
  cart: CartLine[];
  email: string;
  name: string;
  phone: string;
  address: Address;
  shippingMethod: "standard" | "express";
  payment: "cod" | "upi" | "card";
  code?: string;
  note?: string;
  giftMessage?: string;
  customerId?: number | null;
  marketing?: boolean;
};

async function nextOrderNumber() {
  const r = await get<{ n: number }>("SELECT COUNT(*) AS n FROM orders");
  let n = 1001 + Number(r?.n ?? 0);
  // Gaps can exist after deletions; walk forward until free.
  while (await get("SELECT 1 FROM orders WHERE number = ?", [`KY${n}`])) n++;
  return `KY${n}`;
}

export async function placeOrder(input: PlaceOrderInput) {
  const q = await quote(input.cart, { code: input.code, shippingMethod: input.shippingMethod, payment: input.payment });
  if (!q.lines.length) return { ok: false as const, error: "Your bag is empty." };
  if (q.problems.length) return { ok: false as const, error: q.problems[0], quote: q };

  const client = await db();
  const email = input.email.trim().toLowerCase();
  let customerId = input.customerId ?? null;
  if (!customerId) {
    const existing = await get<{ id: number }>("SELECT id FROM customers WHERE email = ?", [email]);
    customerId =
      existing?.id ??
      (await run("INSERT INTO customers (email, name, phone, accepts_marketing) VALUES (?,?,?,?)", [
        email,
        input.name,
        input.phone,
        input.marketing ? 1 : 0,
      ])).id;
  }
  if (input.marketing) await run("INSERT OR IGNORE INTO subscribers (email, source) VALUES (?, 'checkout')", [email]);

  const number = await nextOrderNumber();
  const token = crypto.randomBytes(12).toString("base64url");
  // Test-mode online payments are captured immediately; COD is collected on delivery.
  const paid = input.payment !== "cod";

  const tx = await client.transaction("write");
  try {
    for (const l of q.lines) {
      const r = await tx.execute({ sql: "UPDATE variants SET stock = stock - ? WHERE id = ? AND stock >= ?", args: [l.qty, l.variantId, l.qty] });
      if (r.rowsAffected !== 1) throw new Error(`STOCK:${l.title}`);
    }
    const o = await tx.execute({
      sql: `INSERT INTO orders (number, token, customer_id, email, name, phone, address, shipping_method, subtotal, discount, shipping, cod_fee, tax, total,
              discount_code, payment_method, payment_status, note, gift_message)
            VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`,
      args: [
        number, token, customerId, email, input.name, input.phone, JSON.stringify(input.address), input.shippingMethod,
        q.subtotal, q.discount, q.shipping, q.codFee, q.tax, q.total, q.discountCode, input.payment, paid ? "paid" : "pending",
        input.note ?? "", input.giftMessage ?? "",
      ],
    });
    const orderId = Number(o.lastInsertRowid);
    for (const l of q.lines) {
      await tx.execute({
        sql: "INSERT INTO order_items (order_id, product_id, variant_id, title, variant_title, sku, image, price, qty) VALUES (?,?,?,?,?,?,?,?,?)",
        args: [orderId, l.productId, l.variantId, l.title, l.variantTitle, l.sku, l.image, l.price, l.qty],
      });
    }
    await tx.execute({
      sql: "INSERT INTO order_events (order_id, kind, message) VALUES (?, 'placed', ?)",
      args: [orderId, `Order placed by ${input.name} — ${paymentLabel(input.payment)}${paid ? " (paid, test mode)" : ""}.`],
    });
    if (q.discountCode) await tx.execute({ sql: "UPDATE discounts SET used = used + 1 WHERE code = ?", args: [q.discountCode] });
    await tx.commit();
    return { ok: true as const, number, token, total: q.total };
  } catch (e) {
    await tx.rollback();
    const msg = String((e as Error).message);
    if (msg.startsWith("STOCK:")) return { ok: false as const, error: `${msg.slice(6)} just sold out. Please review your bag.` };
    throw e;
  } finally {
    tx.close();
  }
}

export const paymentLabel = (m: string) =>
  ({ cod: "Cash on delivery", upi: "UPI", card: "Card" })[m] ?? m;

export type Order = {
  id: number;
  number: string;
  token: string;
  customer_id: number | null;
  email: string;
  name: string;
  phone: string;
  address: string;
  shipping_method: string;
  subtotal: number;
  discount: number;
  shipping: number;
  cod_fee: number;
  tax: number;
  total: number;
  discount_code: string;
  payment_method: string;
  payment_status: string;
  fulfillment_status: string;
  status: string;
  carrier: string;
  tracking_number: string;
  note: string;
  gift_message: string;
  is_sample: number;
  created_at: string;
  updated_at: string;
};

export type OrderItem = {
  id: number;
  order_id: number;
  product_id: number | null;
  variant_id: number | null;
  title: string;
  variant_title: string;
  sku: string;
  image: string;
  price: number;
  qty: number;
};

export type OrderEvent = { id: number; order_id: number; kind: string; message: string; created_at: string };

export async function getOrderFull(where: { id?: number; number?: string }) {
  const o = where.id
    ? await get<Order>("SELECT * FROM orders WHERE id = ?", [where.id])
    : await get<Order>("SELECT * FROM orders WHERE number = ? COLLATE NOCASE", [where.number ?? ""]);
  if (!o) return null;
  const [items, events] = await Promise.all([
    all<OrderItem>("SELECT * FROM order_items WHERE order_id = ? ORDER BY id", [o.id]),
    all<OrderEvent>("SELECT * FROM order_events WHERE order_id = ? ORDER BY created_at DESC, id DESC", [o.id]),
  ]);
  return { ...o, address: JSON.parse(o.address || "{}") as Address, items, events };
}

export type OrderFull = NonNullable<Awaited<ReturnType<typeof getOrderFull>>>;

export const FULFILLMENT_STEPS = [
  { id: "unfulfilled", label: "Order received" },
  { id: "packed", label: "Packed" },
  { id: "shipped", label: "Shipped" },
  { id: "delivered", label: "Delivered" },
] as const;
