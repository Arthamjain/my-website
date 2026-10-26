import { all } from "@/lib/db";
import { setMessageStatus } from "../../actions";
import { Badge, Card, PageHeader, btnSecondary, dateTime } from "@/components/admin/ui";

export default async function MessagesPage() {
  const [msgs, subs] = await Promise.all([
    all<{ id: number; name: string; email: string; subject: string; body: string; status: string; created_at: string }>("SELECT * FROM messages ORDER BY (status = 'new') DESC, created_at DESC"),
    all<{ email: string; source: string; created_at: string }>("SELECT email, source, created_at FROM subscribers ORDER BY created_at DESC"),
  ]);
  return (
    <div className="mx-auto max-w-[1100px]">
      <PageHeader title="Messages" sub="Contact-form messages and your letter list." />
      <div className="grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div className="space-y-3">
          {msgs.map((m) => (
            <Card key={m.id}>
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="font-medium">
                    {m.name} <span className="font-normal text-muted">· {m.subject}</span>
                  </p>
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + m.subject)}`} className="text-[13px] text-indigo hover:underline">
                    {m.email}
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[12px] text-muted">{dateTime(m.created_at)}</span>
                  <Badge tone={m.status === "new" ? "amber" : "green"}>{m.status === "new" ? "New" : "Done"}</Badge>
                </div>
              </div>
              <p className="mt-3 whitespace-pre-wrap text-[14px]">{m.body}</p>
              <div className="mt-4 flex gap-2">
                <a href={`mailto:${m.email}?subject=${encodeURIComponent("Re: " + m.subject)}`} className={btnSecondary}>
                  Reply by email
                </a>
                <form action={setMessageStatus}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="op" value={m.status === "new" ? "done" : "new"} />
                  <button className={btnSecondary}>{m.status === "new" ? "Mark done" : "Mark as new"}</button>
                </form>
                <form action={setMessageStatus}>
                  <input type="hidden" name="id" value={m.id} />
                  <input type="hidden" name="op" value="delete" />
                  <button className={`${btnSecondary} text-bad`}>Delete</button>
                </form>
              </div>
            </Card>
          ))}
          {msgs.length === 0 && <Card><p className="text-muted">No messages yet.</p></Card>}
        </div>
        <Card title={`Letter list · ${subs.length}`}>
          <ul className="max-h-[520px] divide-y divide-black/[0.05] overflow-y-auto text-[13px]">
            {subs.map((s) => (
              <li key={s.email} className="flex justify-between gap-2 py-2">
                <span className="truncate">{s.email}</span>
                <span className="shrink-0 text-muted">{s.source}</span>
              </li>
            ))}
            {subs.length === 0 && <li className="py-2 text-muted">No subscribers yet.</li>}
          </ul>
        </Card>
      </div>
    </div>
  );
}
