import Link from "next/link";

export default function NotFound() {
  return (
    <div className="grid min-h-[70vh] place-items-center px-4 text-center">
      <div>
        <p className="hand text-[48px] text-muted">This page is blank.</p>
        <p className="mt-2 text-[15px] text-muted">Which is lovely in a journal, less so on a website.</p>
        <Link href="/" className="btn btn-primary mt-8">
          Back to the shop
        </Link>
      </div>
    </div>
  );
}
