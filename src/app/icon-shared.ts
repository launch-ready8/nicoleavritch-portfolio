import { readFile } from "node:fs/promises";
import path from "node:path";
import { getSettings } from "@/lib/sanity";

/* Shared by icon.tsx / apple-icon.tsx: the site owner's initials drawn in the
 * current headline font (CMS-uploaded file if set, Anton otherwise). */

export async function headlineFontData(url?: string): Promise<ArrayBuffer> {
  if (url) {
    try {
      const r = await fetch(url);
      if (r.ok) return await r.arrayBuffer();
    } catch {
      /* fall through to the bundled face */
    }
  }
  const buf = await readFile(
    path.join(process.cwd(), "node_modules/@fontsource/anton/files/anton-latin-400-normal.woff")
  );
  return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
}

export async function iconSetup() {
  const s = await getSettings();
  const [a = "N", b = "A"] = s.siteTitle.split(" ");
  const initials = `${a[0] || "N"}${b[0] || "A"}`.toUpperCase();
  const data = await headlineFontData(s.theme.headlineFontUrl);
  return { initials, data, ink: s.theme.ink, paper: s.theme.background };
}
