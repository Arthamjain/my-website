import Header from "@/components/store/Header";
import Footer from "@/components/store/Footer";
import CartDrawer from "@/components/store/CartDrawer";
import Tracker from "@/components/store/Tracker";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

export default async function StoreLayout({ children }: LayoutProps<"/">) {
  const s = await getSettings();
  return (
    <>
      <Header announcement={s.announcement} />
      <main>{children}</main>
      <Footer email={s.support_email} phone={s.support_phone} />
      <CartDrawer threshold={s.free_shipping_threshold} />
      <Tracker />
    </>
  );
}
