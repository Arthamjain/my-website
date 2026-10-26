import { get } from "@/lib/db";

export async function GET(_req: Request, ctx: RouteContext<"/api/media/[id]">) {
  const { id } = await ctx.params;
  const row = await get<{ mime: string; data: ArrayBuffer }>("SELECT mime, data FROM media WHERE id = ?", [Number(id)]);
  if (!row) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(row.data), {
    headers: { "Content-Type": row.mime, "Cache-Control": "public, max-age=31536000, immutable" },
  });
}
