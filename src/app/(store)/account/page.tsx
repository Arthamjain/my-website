import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getCustomer } from "@/lib/auth";
import { all } from "@/lib/db";
import { formatINR } from "@/lib/utils";
import { logout } from "../actions";

export const metadata: Metadata = { title: "Your account", robots: { index: false } };

const STATUS: Record<string, string> = { unfulfilled: "Being prepared", packed: "Packed", shipped: "On its way", delivered: "Delivered" };

export default async function AccountPage() {
  const c = await getCustomer();
  if (!c) redirect("/account/login");
  const orders = await all<{ number: string; token: string; total: number; created_at: string; fulfillment_status: string; status: string; items: number }>(
    `SELECT number, token, total, created_at, fulfillment_status, status, (SELECT SUM(qty) FROM order_items i WHERE i.order_id = o.id) AS items
     FROM orders o WHERE customer_id = ? OR email = ? ORDER BY id DESC`,
    [c.id, c.email],
  );
  return (
    <div className="mx-auto max-w-[900px] px-4 py-12 md:px-8 md:py-16">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Your account</p>
          <h1 className="h1 mt-2">Hello, {c.name.split(" ")[0] || "there"}</h1>
          <p className="mt-2 text-[14px] text-muted">{c.email}</p>
        </div>
        <form action={logout}>
          <button className="btn btn-ghost">Sign out</button>
        </form>
      </div>
      <h2 className="h3 mt-12">Orders</h2>
      {orders.length === 0 ? (
        <p className="mt-4 text-[15px] text-muted">
          No orders yet.{" "}
          <Link href="/shop" className="text-ink underline">
            Find your first journal
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-4 divide-y divide-line border-y border-line">
          {orders.map((o) => (
            <li key={o.number}>
              <Link href={`/order/${o.number}?t=${o.token}`} className="flex flex-wrap items-center justify-between gap-3 py-5 hover:bg-linen/50">
                <div>
                  <p className="font-medium">{o.number}</p>
                  <p className="text-[13px] text-muted">
                    {new Date(o.created_at + "Z").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })} · {o.items} item{o.items > 1 ? "s" : ""}
                  </p>
                </div>
                <span className="text-[13.5px]">{o.status === "cancelled" ? "Cancelled" : STATUS[o.fulfillment_status]}</span>
                <span className="tabular-nums">{formatINR(o.total)}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
