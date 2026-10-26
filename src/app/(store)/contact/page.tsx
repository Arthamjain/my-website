import type { Metadata } from "next";
import Image from "next/image";
import SimpleForm from "@/components/store/SimpleForm";
import { getSettings } from "@/lib/settings";
import { sendMessage } from "../actions";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const s = await getSettings();
  return (
    <div className="mx-auto grid max-w-[1180px] gap-12 px-4 py-12 md:grid-cols-2 md:px-8 md:py-16">
      <div>
        <h1 className="h1">Write to us</h1>
        <p className="mt-3 max-w-md text-[15px] text-muted">
          Questions about an order, a custom batch for your team, or just a photo of your journal in use — we read everything.
        </p>
        <div className="mt-8">
          <SimpleForm action={sendMessage} submit="Send message">
            <div className="grid gap-4 sm:grid-cols-2">
              <label>
                <span className="label">Name</span>
                <input name="name" required className="input" />
              </label>
              <label>
                <span className="label">Email</span>
                <input name="email" type="email" required className="input" />
              </label>
            </div>
            <label>
              <span className="label">Subject</span>
              <select name="subject" className="input">
                <option>An order</option>
                <option>Product question</option>
                <option>Corporate or bulk gifting</option>
                <option>Something else</option>
              </select>
            </label>
            <label>
              <span className="label">Message</span>
              <textarea name="body" rows={6} required className="input" />
            </label>
          </SimpleForm>
        </div>
        <div className="mt-10 space-y-1 text-[14px] text-muted">
          <p>
            Email: <a href={`mailto:${s.support_email}`} className="text-ink underline">{s.support_email}</a>
          </p>
          <p>Phone / WhatsApp: {s.support_phone} (Mon–Sat, 10am–6pm IST)</p>
        </div>
      </div>
      <div className="relative hidden min-h-[520px] overflow-hidden rounded-[28px] md:block">
        <Image src="/images/writer-hands.jpg" alt="Someone writing a letter by hand" fill sizes="50vw" className="object-cover" />
      </div>
    </div>
  );
}
