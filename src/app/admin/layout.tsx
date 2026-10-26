import type { Metadata } from "next";

export const metadata: Metadata = { title: { default: "Admin", template: "%s · Admin" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default function AdminRoot({ children }: LayoutProps<"/admin">) {
  return <div className="min-h-screen bg-[#F7F5F1] font-sans text-[14px] text-ink">{children}</div>;
}
