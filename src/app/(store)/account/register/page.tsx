import type { Metadata } from "next";
import Link from "next/link";
import SimpleForm from "@/components/store/SimpleForm";
import { register } from "../../actions";

export const metadata: Metadata = { title: "Create an account" };

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-16 md:py-24">
      <h1 className="h1">Create an account</h1>
      <div className="mt-8">
        <SimpleForm action={register} submit="Create account">
          <label>
            <span className="label">Full name</span>
            <input name="name" required autoComplete="name" className="input" />
          </label>
          <label>
            <span className="label">Email</span>
            <input name="email" type="email" required autoComplete="email" className="input" />
          </label>
          <label>
            <span className="label">Password (8+ characters)</span>
            <input name="password" type="password" required minLength={8} autoComplete="new-password" className="input" />
          </label>
          <label className="flex items-center gap-2 text-[13.5px] text-muted">
            <input type="checkbox" name="marketing" defaultChecked className="accent-ink" /> Send me letters about new batches
          </label>
        </SimpleForm>
      </div>
      <p className="mt-8 text-[14px] text-muted">
        Already have an account?{" "}
        <Link href="/account/login" className="text-ink underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
