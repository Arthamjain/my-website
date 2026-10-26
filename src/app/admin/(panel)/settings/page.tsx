import { adminBase } from "@/lib/auth";
import { get } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { Card, PageHeader } from "@/components/admin/ui";
import { SampleDataButtons, SettingsForm } from "@/components/admin/SettingsForms";

export default async function SettingsPage() {
  const [s, sample] = await Promise.all([getSettings(), get<{ n: number }>("SELECT COUNT(*) AS n FROM orders WHERE is_sample = 1")]);
  return (
    <div className="mx-auto max-w-[900px] space-y-4">
      <PageHeader title="Settings" />
      <Card title="Store">
        <SettingsForm s={s} />
      </Card>
      <Card title="Admin access">
        <p className="text-[13.5px]">
          This admin lives at <code className="rounded bg-[#F1EEE8] px-1.5 py-0.5">{adminBase()}</code>. The address, email and password are set in the
          <code className="mx-1 rounded bg-[#F1EEE8] px-1.5 py-0.5">.env.local</code>
          file (or your hosting provider&apos;s environment variables): <code>ADMIN_PATH</code>, <code>ADMIN_EMAIL</code>, <code>ADMIN_PASSWORD</code>.
          Change them there and restart to update.
        </p>
      </Card>
      <Card title="Payments">
        <p className="text-[13.5px]">
          Cash on delivery works now. UPI and card payments run in <strong>test mode</strong>: orders are marked paid without charging anyone. To take real
          payments, connect Razorpay (or Stripe) — the README explains where it plugs in.
        </p>
      </Card>
      <Card title="Sample data">
        <p className="mb-4 text-[13.5px] text-muted">
          Fill the dashboard with 60 days of realistic test orders, customers and traffic to see how everything works. Sample records are labelled and never
          change your real stock.
        </p>
        <SampleDataButtons loaded={Number(sample?.n) > 0} />
      </Card>
    </div>
  );
}
