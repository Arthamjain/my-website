import Sidebar from "@/components/admin/Sidebar";
import { adminBase, requireAdmin } from "@/lib/auth";
import { get } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { adminLogout } from "../actions";

export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const admin = await requireAdmin();
  const [settings, orders, reviews, messages] = await Promise.all([
    getSettings(),
    get<{ n: number }>("SELECT COUNT(*) AS n FROM orders WHERE status = 'open' AND fulfillment_status = 'unfulfilled'"),
    get<{ n: number }>("SELECT COUNT(*) AS n FROM reviews WHERE status = 'pending'"),
    get<{ n: number }>("SELECT COUNT(*) AS n FROM messages WHERE status = 'new'"),
  ]);
  return (
    <div className="lg:flex">
      <Sidebar
        base={adminBase()}
        email={admin.email}
        storeName={settings.store_name}
        badges={{ orders: Number(orders?.n ?? 0), reviews: Number(reviews?.n ?? 0), messages: Number(messages?.n ?? 0) }}
        logout={adminLogout}
      />
      <div className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">{children}</div>
    </div>
  );
}
