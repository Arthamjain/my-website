import "server-only";
import crypto from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { get } from "./db";

const ADMIN_COOKIE = "kaya_admin";
const CUSTOMER_COOKIE = "kaya_customer";

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s && process.env.NODE_ENV === "production") throw new Error("SESSION_SECRET must be set in production.");
  return s || "dev-only-secret-change-me";
}

const sign = (payload: string) => crypto.createHmac("sha256", secret()).update(payload).digest("base64url");

function seal(data: Record<string, unknown>, maxAgeSec: number) {
  const body = Buffer.from(JSON.stringify({ ...data, exp: Date.now() + maxAgeSec * 1000 })).toString("base64url");
  return `${body}.${sign(body)}`;
}

function unseal<T>(value: string | undefined): T | null {
  if (!value) return null;
  const [body, mac] = value.split(".");
  if (!body || !mac) return null;
  const expected = sign(body);
  if (mac.length !== expected.length || !crypto.timingSafeEqual(Buffer.from(mac), Buffer.from(expected))) return null;
  try {
    const data = JSON.parse(Buffer.from(body, "base64url").toString());
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return data as T;
  } catch {
    return null;
  }
}

const cookieOpts = (maxAge: number) => ({
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge,
});

/* ----------------------------------- admin ----------------------------------- */

export const adminBase = () => `/${(process.env.ADMIN_PATH || "studio").replace(/^\/+|\/+$/g, "")}`;

export function checkAdminCredentials(email: string, password: string) {
  const wantEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
  const wantPw = process.env.ADMIN_PASSWORD || "";
  if (!wantPw) return false;
  const a = crypto.createHash("sha256").update(`${email.trim().toLowerCase()}\n${password}`).digest();
  const b = crypto.createHash("sha256").update(`${wantEmail}\n${wantPw}`).digest();
  return crypto.timingSafeEqual(a, b);
}

export async function startAdminSession(email: string) {
  (await cookies()).set(ADMIN_COOKIE, seal({ role: "admin", email }, 60 * 60 * 12), cookieOpts(60 * 60 * 12));
}

export async function endAdminSession() {
  (await cookies()).delete(ADMIN_COOKIE);
}

export async function getAdmin() {
  return unseal<{ role: string; email: string }>((await cookies()).get(ADMIN_COOKIE)?.value);
}

/** Data-access guard: every admin page and action calls this. */
export async function requireAdmin() {
  const s = await getAdmin();
  if (!s || s.role !== "admin") redirect(`${adminBase()}/login`);
  return s;
}

/* --------------------------------- customers --------------------------------- */

export function hashPassword(pw: string) {
  const salt = crypto.randomBytes(16);
  const key = crypto.scryptSync(pw, salt, 64);
  return `${salt.toString("hex")}:${key.toString("hex")}`;
}

export function verifyPassword(pw: string, stored: string | null) {
  if (!stored) return false;
  const [salt, key] = stored.split(":");
  const test = crypto.scryptSync(pw, Buffer.from(salt, "hex"), 64);
  const want = Buffer.from(key, "hex");
  return want.length === test.length && crypto.timingSafeEqual(test, want);
}

export async function startCustomerSession(id: number) {
  (await cookies()).set(CUSTOMER_COOKIE, seal({ cid: id }, 60 * 60 * 24 * 30), cookieOpts(60 * 60 * 24 * 30));
}

export async function endCustomerSession() {
  (await cookies()).delete(CUSTOMER_COOKIE);
}

export type Customer = { id: number; email: string; name: string; phone: string; accepts_marketing: number; created_at: string };

export async function getCustomer() {
  const s = unseal<{ cid: number }>((await cookies()).get(CUSTOMER_COOKIE)?.value);
  if (!s) return null;
  return (await get<Customer>("SELECT id, email, name, phone, accepts_marketing, created_at FROM customers WHERE id = ?", [s.cid])) ?? null;
}
