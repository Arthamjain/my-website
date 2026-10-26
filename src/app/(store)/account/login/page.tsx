import type { Metadata } from "next";
import Link from "next/link";
import SimpleForm from "@/components/store/SimpleForm";
import { login } from "../../actions";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({ searchParams }: PageProps<"/account/login">) {
  const { next } = await searchParams;
  return (
    <div className="mx-auto max-w-md px-4 py-16 md:py-24">
      <h1 className="h1">Sign in</h1>
      <p className="mt-3 text-[15px] text-muted">See your orders and check out faster.</p>
      <div className="mt-8">
        <SimpleForm action={login} submit="Sign in">
          <input type="hidden" name="next" value={typeof next === "string" ? next : ""} />
          <label>
            <span className="label">Email</span>
            <input name="email" type="email" required autoComplete="email" className="input" />
          </label>
          <label>
            <span className="label">Password</span>
            <input name="password" type="password" required autoComplete="current-password" className="input" />
          </label>
        </SimpleForm>
      </div>
      <p className="mt-8 text-[14px] text-muted">
        New here?{" "}
        <Link href="/account/register" className="text-ink underline">
          Create an account
        </Link>
        . Bought as a guest before? Register with the same email and your past orders will appear.
      </p>
    </div>
  );
}
