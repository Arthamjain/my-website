import { all } from "@/lib/db";
import { moderateReview } from "../../actions";
import { Badge, Card, PageHeader, btnPrimary, btnSecondary, dateOnly } from "@/components/admin/ui";

export default async function ReviewsPage() {
  const rows = await all<{ id: number; product: string; name: string; location: string; rating: number; title: string; body: string; status: string; verified: number; created_at: string }>(
    "SELECT r.*, p.title AS product FROM reviews r JOIN products p ON p.id = r.product_id ORDER BY (r.status = 'pending') DESC, r.created_at DESC",
  );
  return (
    <div className="mx-auto max-w-[900px]">
      <PageHeader title="Reviews" sub="New reviews wait here until you publish them." />
      <div className="space-y-3">
        {rows.map((r) => (
          <Card key={r.id}>
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-[12.5px] text-muted">{r.product}</p>
                <p className="mt-1 text-brass">{"★".repeat(r.rating)}<span className="text-black/15">{"★".repeat(5 - r.rating)}</span></p>
                {r.title && <p className="mt-1 font-medium">{r.title}</p>}
                <p className="mt-1 text-[14px]">{r.body}</p>
                <p className="mt-2 text-[12.5px] text-muted">
                  {r.name}
                  {r.location && `, ${r.location}`} · {dateOnly(r.created_at)} {r.verified ? "· Verified buyer" : ""}
                </p>
              </div>
              <Badge tone={r.status === "published" ? "green" : r.status === "pending" ? "amber" : "grey"}>{r.status}</Badge>
            </div>
            <div className="mt-4 flex gap-2">
              {r.status !== "published" && (
                <form action={moderateReview}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="op" value="publish" />
                  <button className={btnPrimary}>Publish</button>
                </form>
              )}
              {r.status === "published" && (
                <form action={moderateReview}>
                  <input type="hidden" name="id" value={r.id} />
                  <input type="hidden" name="op" value="hide" />
                  <button className={btnSecondary}>Hide</button>
                </form>
              )}
              <form action={moderateReview}>
                <input type="hidden" name="id" value={r.id} />
                <input type="hidden" name="op" value="delete" />
                <button className={`${btnSecondary} text-bad`}>Delete</button>
              </form>
            </div>
          </Card>
        ))}
        {rows.length === 0 && <Card><p className="text-muted">No reviews yet. Shoppers can write one from any product page.</p></Card>}
      </div>
    </div>
  );
}
