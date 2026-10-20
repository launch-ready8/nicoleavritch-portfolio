import { NextResponse } from "next/server";
import { projectId, dataset } from "@/sanity/env";

/* Serves CMS-uploaded font files from the site's own origin.
 * Browsers refuse cross-origin fonts without CORS headers (which Sanity's
 * file CDN doesn't send), and Vercel's external-rewrite proxy proved flaky
 * (intermittent 503s on font-destination requests) — so this route fetches
 * the file server-side and returns it directly, cached for a year. */

const TYPES: Record<string, string> = {
  ttf: "font/ttf",
  otf: "font/otf",
  woff: "font/woff",
  woff2: "font/woff2",
};

export async function GET(_req: Request, ctx: { params: Promise<{ file: string }> }) {
  const { file } = await ctx.params;
  if (!/^[a-zA-Z0-9]+\.(ttf|otf|woff2?)$/.test(file)) {
    return new NextResponse("Not found", { status: 404 });
  }
  const upstream = await fetch(`https://cdn.sanity.io/files/${projectId}/${dataset}/${file}`, {
    cache: "force-cache",
  });
  if (!upstream.ok) {
    return new NextResponse("Upstream error", { status: 502 });
  }
  const buf = await upstream.arrayBuffer();
  const ext = file.split(".").pop()!.toLowerCase();
  return new NextResponse(buf, {
    headers: {
      "Content-Type": TYPES[ext] || "application/octet-stream",
      "Cache-Control": "public, max-age=31536000, immutable",
      "Access-Control-Allow-Origin": "*",
    },
  });
}
