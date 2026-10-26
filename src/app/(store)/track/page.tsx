import type { Metadata } from "next";
import SimpleForm from "@/components/store/SimpleForm";
import { trackOrder } from "../actions";

export const metadata: Metadata = { title: "Track your order" };

export default function TrackPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 md:py-24">
      <h1 className="h1">Track your order</h1>
      <p className="mt-3 text-[15px] text-muted">Enter the order number from your confirmation email (it starts with KY) and the email you used.</p>
      <div className="mt-8">
        <SimpleForm action={trackOrder} submit="Find my order">
          <label>
            <span className="label">Order number</span>
            <input name="number" required placeholder="KY1001" className="input uppercase" />
          </label>
          <label>
            <span className="label">Email</span>
            <input name="email" type="email" required className="input" />
          </label>
        </SimpleForm>
      </div>
    </div>
  );
}
