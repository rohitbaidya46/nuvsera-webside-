import { getObject } from "@/lib/storage";
import { mimeForExt } from "@/lib/uploads";

/** Serves public media (images) from storage. Private files are never reachable here. */
export async function GET(_req: Request, { params }: { params: Promise<{ key: string[] }> }) {
  const { key } = await params;
  const path = key.join("/");
  if (!/^[A-Za-z0-9/_.-]+$/.test(path) || path.includes("..")) return new Response("Not found", { status: 404 });
  const body = await getObject(`public/${path}`);
  if (!body) return new Response("Not found", { status: 404 });
  const ext = path.split(".").pop() || "";
  return new Response(new Uint8Array(body), {
    headers: {
      "content-type": mimeForExt(ext),
      "cache-control": "public, max-age=31536000, immutable",
      "x-content-type-options": "nosniff",
      ...(ext === "svg" ? { "content-security-policy": "default-src 'none'; style-src 'unsafe-inline'; sandbox" } : {}),
    },
  });
}
