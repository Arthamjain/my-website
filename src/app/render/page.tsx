import { notFound } from "next/navigation";
import RenderStage from "./RenderStage";

/** Development-only photo stage used to produce the catalogue renders in /public/images/renders. */
export default async function RenderPage({ searchParams }: PageProps<"/render">) {
  if (process.env.NODE_ENV === "production") notFound();
  const sp = await searchParams;
  return <RenderStage scene={String(sp.scene ?? "hero")} fabric={String(sp.fabric ?? "dabu")} />;
}
