"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { get, run } from "@/lib/db";
import { quote, placeOrder, type CartLine, type PlaceOrderInput } from "@/lib/orders";
import { endCustomerSession, getCustomer, hashPassword, startCustomerSession, verifyPassword } from "@/lib/auth";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const clean = (v: FormDataEntryValue | null, max = 500) => String(v ?? "").trim().slice(0, max);

export type FormState = { ok?: boolean; error?: string; message?: string };

export async function subscribe(_: FormState, fd: FormData): Promise<FormState> {
  const email = clean(fd.get("email"), 200).toLowerCase();
  if (!EMAIL.test(email)) return { error: "Please enter a valid email." };
  await run("INSERT OR IGNORE INTO subscribers (email, source) VALUES (?, ?)", [email, clean(fd.get("source"), 40) || "footer"]);
  return { ok: true, message: "You're on the list. First letter arrives with the next batch." };
}

export async function sendMessage(_: FormState, fd: FormData): Promise<FormState> {
  const name = clean(fd.get("name"), 120);
  const email = clean(fd.get("email"), 200).toLowerCase();
  const subject = clean(fd.get("subject"), 160);
  const body = clean(fd.get("body"), 4000);
  if (!name || !EMAIL.test(email) || body.length < 5) return { error: "Please add your name, a valid email and a message." };
  await run("INSERT INTO messages (name, email, subject, body) VALUES (?,?,?,?)", [name, email, subject, body]);
  return { ok: true, message: "Thank you — a real person will reply within one working day." };
}

export async function getQuote(cart: CartLine[], opts: { code?: string; shippingMethod?: string; payment?: string }) {
  return quote(cart.slice(0, 50), opts);
}

export async function checkout(input: Omit<PlaceOrderInput, "customerId">) {
  const errors: string[] = [];
  if (!EMAIL.test(input.email ?? "")) errors.push("a valid email");
  if (!input.name?.trim()) errors.push("your full name");
  if (!/^[0-9+\s-]{10,15}$/.test(input.phone ?? "")) errors.push("a 10-digit phone number");
  const a = input.address ?? ({} as PlaceOrderInput["address"]);
  if (!a.line1?.trim() || !a.city?.trim() || !a.state?.trim()) errors.push("your full address");
  if (!/^[1-9][0-9]{5}$/.test(a.pincode ?? "")) errors.push("a 6-digit PIN code");
  if (!["cod", "upi", "card"].includes(input.payment)) errors.push("a payment method");
  if (errors.length) return { ok: false as const, error: `Please add ${errors.join(", ")}.` };

  const customer = await getCustomer();
  const res = await placeOrder({
    ...input,
    shippingMethod: input.shippingMethod === "express" ? "express" : "standard",
    name: input.name.trim().slice(0, 120),
    email: input.email.trim().slice(0, 200),
    phone: input.phone.trim(),
    note: (input.note ?? "").slice(0, 1000),
    giftMessage: (input.giftMessage ?? "").slice(0, 400),
    customerId: customer?.id ?? null,
  });
  if (res.ok) revalidatePath("/", "layout");
  return res;
}

export async function submitReview(_: FormState, fd: FormData): Promise<FormState> {
  const productId = Number(fd.get("productId"));
  const rating = Math.round(Number(fd.get("rating")));
  const name = clean(fd.get("name"), 80);
  const body = clean(fd.get("body"), 2000);
  if (!productId || !(rating >= 1 && rating <= 5) || !name || body.length < 10)
    return { error: "Please choose a rating, add your name and write at least a sentence." };
  const email = clean(fd.get("email"), 200).toLowerCase();
  // A review is marked verified when the email has bought this product.
  const bought = email
    ? await get("SELECT 1 FROM orders o JOIN order_items i ON i.order_id = o.id WHERE o.email = ? AND i.product_id = ? LIMIT 1", [email, productId])
    : undefined;
  await run("INSERT INTO reviews (product_id, name, location, rating, title, body, verified) VALUES (?,?,?,?,?,?,?)", [
    productId,
    name,
    clean(fd.get("location"), 80),
    rating,
    clean(fd.get("title"), 120),
    body,
    bought ? 1 : 0,
  ]);
  return { ok: true, message: "Thank you. Your review will appear once we've read it — usually within a day." };
}

export async function register(_: FormState, fd: FormData): Promise<FormState> {
  const name = clean(fd.get("name"), 120);
  const email = clean(fd.get("email"), 200).toLowerCase();
  const password = String(fd.get("password") ?? "");
  if (!name || !EMAIL.test(email)) return { error: "Please add your name and a valid email." };
  if (password.length < 8) return { error: "Choose a password with at least 8 characters." };
  const existing = await get<{ id: number; password_hash: string | null }>("SELECT id, password_hash FROM customers WHERE email = ?", [email]);
  let id: number;
  if (existing?.password_hash) return { error: "An account with this email already exists. Try signing in." };
  if (existing) {
    // Guest checkout customers can claim their account and see past orders.
    await run("UPDATE customers SET name = ?, password_hash = ? WHERE id = ?", [name, hashPassword(password), existing.id]);
    id = existing.id;
  } else {
    id = (await run("INSERT INTO customers (email, name, password_hash, accepts_marketing) VALUES (?,?,?,?)", [
      email,
      name,
      hashPassword(password),
      fd.get("marketing") ? 1 : 0,
    ])).id;
  }
  await startCustomerSession(id);
  redirect("/account");
}

export async function login(_: FormState, fd: FormData): Promise<FormState> {
  const email = clean(fd.get("email"), 200).toLowerCase();
  const password = String(fd.get("password") ?? "");
  const c = await get<{ id: number; password_hash: string | null }>("SELECT id, password_hash FROM customers WHERE email = ?", [email]);
  if (!c || !verifyPassword(password, c.password_hash)) return { error: "That email and password don't match." };
  await startCustomerSession(c.id);
  const next = String(fd.get("next") ?? "");
  redirect(next.startsWith("/") && !next.startsWith("//") ? next : "/account");
}

export async function logout() {
  await endCustomerSession();
  redirect("/");
}

export async function trackOrder(_: FormState, fd: FormData): Promise<FormState> {
  const number = clean(fd.get("number"), 20).toUpperCase().replace(/^#/, "");
  const email = clean(fd.get("email"), 200).toLowerCase();
  const o = await get<{ number: string; token: string }>("SELECT number, token FROM orders WHERE number = ? AND email = ?", [number, email]);
  if (!o) return { error: "We couldn't find an order with that number and email." };
  redirect(`/order/${o.number}?t=${o.token}`);
}
