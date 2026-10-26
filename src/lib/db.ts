import "server-only";
import fs from "node:fs";
import path from "node:path";
import { createClient, type Client, type InArgs, type Row } from "@libsql/client";
import { seedCatalog } from "./seed";

const SCHEMA = `
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  slug TEXT NOT NULL UNIQUE,
  title TEXT NOT NULL,
  subtitle TEXT NOT NULL DEFAULT '',
  category TEXT NOT NULL DEFAULT 'journal',
  description TEXT NOT NULL DEFAULT '',
  story TEXT NOT NULL DEFAULT '',
  details TEXT NOT NULL DEFAULT '[]',
  care TEXT NOT NULL DEFAULT '[]',
  price INTEGER NOT NULL,
  compare_at INTEGER,
  status TEXT NOT NULL DEFAULT 'active',
  featured INTEGER NOT NULL DEFAULT 0,
  mood TEXT NOT NULL DEFAULT '',
  color TEXT NOT NULL DEFAULT '#1C1917',
  color2 TEXT NOT NULL DEFAULT '#FAF7F2',
  texture TEXT NOT NULL DEFAULT '',
  maker TEXT NOT NULL DEFAULT '',
  region TEXT NOT NULL DEFAULT '',
  loom_hours INTEGER NOT NULL DEFAULT 0,
  batch TEXT NOT NULL DEFAULT '',
  tags TEXT NOT NULL DEFAULT '',
  sort INTEGER NOT NULL DEFAULT 100,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS product_images (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  alt TEXT NOT NULL DEFAULT '',
  position INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS variants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  format TEXT NOT NULL DEFAULT '',
  ruling TEXT NOT NULL DEFAULT '',
  sku TEXT NOT NULL DEFAULT '',
  price INTEGER,
  stock INTEGER NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0
);
CREATE TABLE IF NOT EXISTS media (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  mime TEXT NOT NULL,
  data BLOB NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT NOT NULL DEFAULT '',
  password_hash TEXT,
  accepts_marketing INTEGER NOT NULL DEFAULT 0,
  is_sample INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  number TEXT NOT NULL UNIQUE,
  token TEXT NOT NULL,
  customer_id INTEGER REFERENCES customers(id),
  email TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL DEFAULT '{}',
  shipping_method TEXT NOT NULL DEFAULT 'standard',
  subtotal INTEGER NOT NULL,
  discount INTEGER NOT NULL DEFAULT 0,
  shipping INTEGER NOT NULL DEFAULT 0,
  cod_fee INTEGER NOT NULL DEFAULT 0,
  tax INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL,
  discount_code TEXT NOT NULL DEFAULT '',
  payment_method TEXT NOT NULL DEFAULT 'cod',
  payment_status TEXT NOT NULL DEFAULT 'pending',
  fulfillment_status TEXT NOT NULL DEFAULT 'unfulfilled',
  status TEXT NOT NULL DEFAULT 'open',
  carrier TEXT NOT NULL DEFAULT '',
  tracking_number TEXT NOT NULL DEFAULT '',
  note TEXT NOT NULL DEFAULT '',
  gift_message TEXT NOT NULL DEFAULT '',
  is_sample INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS order_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id INTEGER,
  variant_id INTEGER,
  title TEXT NOT NULL,
  variant_title TEXT NOT NULL DEFAULT '',
  sku TEXT NOT NULL DEFAULT '',
  image TEXT NOT NULL DEFAULT '',
  price INTEGER NOT NULL,
  qty INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS order_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id INTEGER NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  kind TEXT NOT NULL DEFAULT 'note',
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS discounts (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  code TEXT NOT NULL UNIQUE,
  kind TEXT NOT NULL DEFAULT 'percent',
  value INTEGER NOT NULL DEFAULT 0,
  min_subtotal INTEGER NOT NULL DEFAULT 0,
  usage_limit INTEGER,
  used INTEGER NOT NULL DEFAULT 0,
  ends_at TEXT,
  active INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL DEFAULT '',
  rating INTEGER NOT NULL,
  title TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  verified INTEGER NOT NULL DEFAULT 0,
  is_sample INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id TEXT NOT NULL,
  kind TEXT NOT NULL,
  path TEXT NOT NULL DEFAULT '',
  product_id INTEGER,
  value INTEGER NOT NULL DEFAULT 0,
  referrer TEXT NOT NULL DEFAULT '',
  device TEXT NOT NULL DEFAULT '',
  is_sample INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE INDEX IF NOT EXISTS events_kind_time ON events(kind, created_at);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  subject TEXT NOT NULL DEFAULT '',
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS subscribers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT NOT NULL UNIQUE,
  source TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
`;

declare global {
  var __kayaDb: Promise<Client> | undefined;
}

/**
 * Serverless hosts (Vercel) have a read-only project folder, so without a hosted
 * database we fall back to the writable /tmp folder. The store works, but data there
 * is temporary — the admin shows a warning until DATABASE_URL is set.
 */
export const usingTemporaryDb = () => !process.env.DATABASE_URL && !!(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);

function databaseUrl() {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (usingTemporaryDb()) return "file:/tmp/kaya.db";
  return "file:data/kaya.db";
}

async function open(): Promise<Client> {
  const url = databaseUrl();
  if (url.startsWith("file:")) {
    const file = url.slice(5);
    fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  }
  const client = createClient({ url, authToken: process.env.DATABASE_AUTH_TOKEN });
  await client.execute("PRAGMA foreign_keys = ON");
  await client.executeMultiple(SCHEMA);
  const { rows } = await client.execute("SELECT COUNT(*) AS n FROM products");
  if (Number(rows[0].n) === 0) await seedCatalog(client);
  return client;
}

export function db(): Promise<Client> {
  globalThis.__kayaDb ??= open().catch((e) => {
    globalThis.__kayaDb = undefined;
    throw e;
  });
  return globalThis.__kayaDb;
}

/** Plain-object rows (libSQL rows are array-like with column getters). */
const plain = <T,>(columns: string[], r: Row) => Object.fromEntries(columns.map((c, i) => [c, r[i]])) as T;

export async function all<T>(sql: string, args: InArgs = []): Promise<T[]> {
  const { rows, columns } = await (await db()).execute({ sql, args });
  return rows.map((r) => plain<T>(columns, r));
}

export async function get<T>(sql: string, args: InArgs = []): Promise<T | undefined> {
  const { rows, columns } = await (await db()).execute({ sql, args });
  return rows[0] ? plain<T>(columns, rows[0]) : undefined;
}

export async function run(sql: string, args: InArgs = []) {
  const r = await (await db()).execute({ sql, args });
  return { id: Number(r.lastInsertRowid ?? 0), changes: r.rowsAffected };
}
