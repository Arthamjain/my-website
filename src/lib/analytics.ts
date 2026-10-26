import "server-only";
import { all, get } from "./db";

export const EVENT_KINDS = ["page_view", "product_view", "add_to_cart", "begin_checkout"] as const;

/** Inclusive day window ending today, as SQLite datetime strings. */
export function range(days: number) {
  const end = new Date();
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - (days - 1));
  start.setUTCHours(0, 0, 0, 0);
  return { start: start.toISOString().replace("T", " ").slice(0, 19), days };
}

const pct = (a: number, b: number) => (b ? (a / b) * 100 : 0);

export async function dashboardStats(days = 30) {
  const { start } = range(days);
  const prevStart = range(days * 2).start;
  const counted = "status != 'cancelled'";

  const [cur, prev, sessions, prevSessions, funnel, daily, top, recent, lowStock, unfulfilled, byPayment] = await Promise.all([
    get<{ revenue: number; orders: number; customers: number }>(
      `SELECT COALESCE(SUM(total),0) AS revenue, COUNT(*) AS orders, COUNT(DISTINCT email) AS customers FROM orders WHERE ${counted} AND created_at >= ?`,
      [start],
    ),
    get<{ revenue: number; orders: number }>(
      `SELECT COALESCE(SUM(total),0) AS revenue, COUNT(*) AS orders FROM orders WHERE ${counted} AND created_at >= ? AND created_at < ?`,
      [prevStart, start],
    ),
    get<{ n: number }>("SELECT COUNT(DISTINCT session_id) AS n FROM events WHERE created_at >= ?", [start]),
    get<{ n: number }>("SELECT COUNT(DISTINCT session_id) AS n FROM events WHERE created_at >= ? AND created_at < ?", [prevStart, start]),
    all<{ kind: string; n: number }>(
      "SELECT kind, COUNT(DISTINCT session_id) AS n FROM events WHERE created_at >= ? GROUP BY kind",
      [start],
    ),
    all<{ day: string; revenue: number; orders: number }>(
      `SELECT substr(created_at,1,10) AS day, SUM(total) AS revenue, COUNT(*) AS orders FROM orders WHERE ${counted} AND created_at >= ? GROUP BY day ORDER BY day`,
      [start],
    ),
    all<{ title: string; product_id: number; units: number; revenue: number }>(
      `SELECT oi.title, oi.product_id, SUM(oi.qty) AS units, SUM(oi.qty * oi.price) AS revenue FROM order_items oi JOIN orders o ON o.id = oi.order_id
       WHERE o.${counted} AND o.created_at >= ? GROUP BY oi.product_id, oi.title ORDER BY revenue DESC LIMIT 6`,
      [start],
    ),
    all<{ id: number; number: string; name: string; total: number; payment_status: string; fulfillment_status: string; created_at: string; status: string }>(
      "SELECT id, number, name, total, payment_status, fulfillment_status, created_at, status FROM orders ORDER BY created_at DESC, id DESC LIMIT 8",
    ),
    all<{ id: number; product_id: number; title: string; vtitle: string; stock: number }>(
      `SELECT v.id, v.product_id, p.title, v.title AS vtitle, v.stock FROM variants v JOIN products p ON p.id = v.product_id
       WHERE p.status = 'active' AND v.stock <= 5 ORDER BY v.stock ASC LIMIT 8`,
    ),
    get<{ n: number }>("SELECT COUNT(*) AS n FROM orders WHERE status = 'open' AND fulfillment_status IN ('unfulfilled','packed')"),
    all<{ payment_method: string; n: number; revenue: number }>(
      `SELECT payment_method, COUNT(*) AS n, SUM(total) AS revenue FROM orders WHERE ${counted} AND created_at >= ? GROUP BY payment_method`,
      [start],
    ),
  ]);

  const f = Object.fromEntries(funnel.map((r) => [r.kind, Number(r.n)]));
  const revenue = Number(cur?.revenue ?? 0);
  const orders = Number(cur?.orders ?? 0);
  const visitors = Number(sessions?.n ?? 0);
  const prevRevenue = Number(prev?.revenue ?? 0);
  const prevOrders = Number(prev?.orders ?? 0);
  const prevVisitors = Number(prevSessions?.n ?? 0);

  // Fill missing days so the chart has an even x-axis.
  const series: { day: string; revenue: number; orders: number }[] = [];
  const map = new Map(daily.map((d) => [d.day, d]));
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - i);
    const key = d.toISOString().slice(0, 10);
    const row = map.get(key);
    series.push({ day: key, revenue: Number(row?.revenue ?? 0), orders: Number(row?.orders ?? 0) });
  }

  return {
    revenue,
    orders,
    aov: orders ? Math.round(revenue / orders) : 0,
    visitors,
    conversion: pct(orders, visitors),
    change: {
      revenue: prevRevenue ? pct(revenue - prevRevenue, prevRevenue) : null,
      orders: prevOrders ? pct(orders - prevOrders, prevOrders) : null,
      visitors: prevVisitors ? pct(visitors - prevVisitors, prevVisitors) : null,
    },
    funnel: [
      { label: "Visited the store", n: visitors },
      { label: "Viewed a product", n: f.product_view ?? 0 },
      { label: "Added to bag", n: f.add_to_cart ?? 0 },
      { label: "Reached checkout", n: f.begin_checkout ?? 0 },
      { label: "Placed an order", n: orders },
    ],
    series,
    top: top.map((t) => ({ ...t, units: Number(t.units), revenue: Number(t.revenue) })),
    recent,
    lowStock,
    unfulfilled: Number(unfulfilled?.n ?? 0),
    byPayment,
  };
}

export async function trafficStats(days = 30) {
  const { start } = range(days);
  const [pages, referrers, devices, products, daily] = await Promise.all([
    all<{ path: string; views: number; visitors: number }>(
      `SELECT path, COUNT(*) AS views, COUNT(DISTINCT session_id) AS visitors FROM events WHERE kind = 'page_view' AND created_at >= ?
       GROUP BY path ORDER BY views DESC LIMIT 12`,
      [start],
    ),
    all<{ referrer: string; visitors: number }>(
      `SELECT CASE WHEN referrer = '' THEN 'Direct' ELSE referrer END AS referrer, COUNT(DISTINCT session_id) AS visitors FROM events
       WHERE kind = 'page_view' AND created_at >= ? GROUP BY 1 ORDER BY visitors DESC LIMIT 8`,
      [start],
    ),
    all<{ device: string; visitors: number }>(
      `SELECT CASE WHEN device = '' THEN 'Unknown' ELSE device END AS device, COUNT(DISTINCT session_id) AS visitors FROM events
       WHERE created_at >= ? GROUP BY 1 ORDER BY visitors DESC`,
      [start],
    ),
    all<{ title: string; views: number; adds: number; units: number }>(
      `SELECT p.title,
         (SELECT COUNT(*) FROM events e WHERE e.product_id = p.id AND e.kind = 'product_view' AND e.created_at >= ?1) AS views,
         (SELECT COUNT(*) FROM events e WHERE e.product_id = p.id AND e.kind = 'add_to_cart' AND e.created_at >= ?1) AS adds,
         (SELECT COALESCE(SUM(oi.qty),0) FROM order_items oi JOIN orders o ON o.id = oi.order_id WHERE oi.product_id = p.id AND o.status != 'cancelled' AND o.created_at >= ?1) AS units
       FROM products p ORDER BY views DESC LIMIT 20`,
      [start],
    ),
    all<{ day: string; visitors: number; views: number }>(
      `SELECT substr(created_at,1,10) AS day, COUNT(DISTINCT session_id) AS visitors, SUM(kind = 'page_view') AS views FROM events
       WHERE created_at >= ? GROUP BY day ORDER BY day`,
      [start],
    ),
  ]);
  const map = new Map(daily.map((d) => [d.day, d]));
  const series = Array.from({ length: days }, (_, k) => {
    const d = new Date();
    d.setUTCDate(d.getUTCDate() - (days - 1 - k));
    const key = d.toISOString().slice(0, 10);
    return { day: key, visitors: Number(map.get(key)?.visitors ?? 0), views: Number(map.get(key)?.views ?? 0) };
  });
  return { pages, referrers, devices, products, series };
}
