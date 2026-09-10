/**
 * HD image upgrade: the July harvest of the old Adobe Portfolio site captured
 * whatever renditions the page HTML listed — for many gallery images that was
 * a small thumbnail (500–900px), which blurs on the live site. Adobe's CDN
 * serves larger renditions at predictable URLs (_rw_1920 / _rw_3840 / the
 * un-suffixed original), so this script:
 *
 *   1. re-fetches each old project page and rebuilds the same ordered URL
 *      list the original seeder used (same extraction + filtering), so index
 *      NN maps to the existing asset named `${slug}-NN.jpg`;
 *   2. for each existing scraped asset narrower than MIN_OK_WIDTH, downloads
 *      the largest rendition it can find and uploads it as `${slug}-hd-NN.jpg`;
 *   3. walks every project document (blocks, sections, heroImage,
 *      previewImage) and repoints references from the small asset to the HD
 *      one — layouts and Studio edits are untouched, only the pixels change.
 *
 * Guarded by hdVersion on the `sectionsMigration` doc; fail-soft (exit 0).
 */
import { createClient } from "@sanity/client";
import fs from "node:fs";

const HD_VERSION = 1;
const MIN_OK_WIDTH = 1400; // assets at least this wide are left alone
const BASE = "https://nicoleavritch.myportfolio.com";
const MAX_SCRAPED_PER_PROJECT = 24; // must match vercel-seed.mjs

const IS_VERCEL = !!process.env.VERCEL;
const token = process.env.SANITY_TOKEN;
if (!IS_VERCEL || !token) {
  console.log("[hd] skipped (not a Vercel build or SANITY_TOKEN not set)");
  process.exit(0);
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "2h8pgj67";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const client = createClient({ projectId, dataset, token, apiVersion: "2024-10-01", useCdn: false });
const UA = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0 Safari/537.36" };

async function getPage(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(`fetch ${url}: ${r.status}`);
  return await r.text();
}

/* identical extraction + best-in-page pick as vercel-seed.mjs, so ordering matches */
function extractImages(html) {
  const all = [...html.matchAll(/https:\/\/cdn\.myportfolio\.com\/[^"'\s\\)]+?\.(?:jpe?g|png|gif|webp)(?:\?[^"'\s\\)]*)?/gi)].map((m) =>
    m[0].replace(/&amp;/g, "&")
  );
  const groups = new Map();
  for (const u of all) {
    if (/favicon|touch-icon/i.test(u)) continue;
    const idMatch = u.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
    const key = idMatch ? idMatch[1] : u.split("?")[0];
    const width = (() => {
      const rw = u.match(/_rw_(\d+)/);
      if (rw) return parseInt(rw[1]);
      const rwc = u.match(/_rwc_\d+x\d+x(\d+)/);
      if (rwc) return parseInt(rwc[1]);
      return 1000;
    })();
    const cur = groups.get(key);
    if (!cur || width > cur.width) groups.set(key, { url: u, width });
  }
  return [...groups.values()].map((g) => g.url);
}

function extractOg(html) {
  const m =
    html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
    html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
  return m ? m[1].replace(/&amp;/g, "&") : null;
}

/* candidate URLs for a bigger rendition, best first */
function hdCandidates(url) {
  const out = [];
  if (/_rw_\d+/.test(url)) {
    for (const w of [3840, 2500, 1920]) out.push(url.replace(/_rw_\d+/, `_rw_${w}`));
    out.push(url.replace(/_rw_\d+\./, ".")); // un-suffixed original, sometimes exists
  } else if (/_rwc_/.test(url)) {
    // cropped renditions: bump the size segment (WxHxQ pattern varies; safest is leaving crop shape)
    for (const w of [3840, 2500, 1920]) out.push(url.replace(/(_rwc_\d+x\d+x)\d+/, `$1${w}`));
  }
  out.push(url); // fall back to what we had
  return [...new Set(out)];
}

async function download(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(String(r.status));
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 8000) throw new Error("too small");
  return buf;
}

async function main() {
  const state = (await client.fetch(`*[_id == "sectionsMigration"][0]`)) || {};
  if ((state.hdVersion || 0) >= HD_VERSION) {
    console.log(`[hd] up to date (v${state.hdVersion})`);
    return;
  }

  const seed = JSON.parse(fs.readFileSync("content/seed.json", "utf8"));
  const refMap = new Map(); // small asset _id -> hd asset _id
  let upgraded = 0, kept = 0, failed = 0;

  for (const p of seed.projects) {
    if (!p.oldSlug) continue;
    let urls;
    try {
      const html = await getPage(`${BASE}/${p.oldSlug}`);
      const og = extractOg(html);
      urls = extractImages(html).filter((u) => u !== og).slice(0, MAX_SCRAPED_PER_PROJECT);
    } catch (e) {
      console.warn(`[hd] ${p.slug}: page fetch failed (${e.message})`);
      continue;
    }

    for (let i = 0; i < urls.length; i++) {
      const fn = `${p.slug}-${String(i + 1).padStart(2, "0")}.jpg`;
      const existing = await client.fetch(
        `*[_type == "sanity.imageAsset" && originalFilename == $fn] | order(metadata.dimensions.width desc)[0]{_id, size, "w": metadata.dimensions.width}`,
        { fn }
      );
      if (!existing) continue; // never referenced/uploaded — nothing to fix
      if ((existing.w || 0) >= MIN_OK_WIDTH) { kept++; continue; }

      let buf = null;
      for (const cand of hdCandidates(urls[i])) {
        try {
          const b = await download(cand);
          if (b.length > (existing.size || 0) * 1.15) { buf = b; break; }
          if (!buf) buf = b; // keep first success as fallback comparison
        } catch { /* try next candidate */ }
      }
      if (!buf || buf.length <= (existing.size || 0)) { failed++; continue; }

      try {
        const hdFn = `${p.slug}-hd-${String(i + 1).padStart(2, "0")}.jpg`;
        const found = await client.fetch(
          `*[_type == "sanity.imageAsset" && originalFilename == $fn && size == $size][0]{_id}`,
          { fn: hdFn, size: buf.length }
        );
        const id = found?._id || (await client.assets.upload("image", buf, { filename: hdFn }))._id;
        refMap.set(existing._id, id);
        upgraded++;
      } catch (e) {
        console.warn(`[hd] ${p.slug} #${i + 1}: upload failed (${e.message})`);
        failed++;
      }
    }
  }

  /* repoint references across all project docs, layouts untouched */
  let docsPatched = 0;
  if (refMap.size) {
    const swap = (node) => {
      if (!node || typeof node !== "object") return false;
      let changed = false;
      if (node.asset?._ref && refMap.has(node.asset._ref)) {
        node.asset = { _type: "reference", _ref: refMap.get(node.asset._ref) };
        changed = true;
      }
      for (const v of Object.values(node)) {
        if (Array.isArray(v)) v.forEach((x) => { if (swap(x)) changed = true; });
        else if (v && typeof v === "object") { if (swap(v)) changed = true; }
      }
      return changed;
    };
    const docs = await client.fetch(`*[_type == "project"]{_id, blocks, sections, heroImage, previewImage}`);
    for (const d of docs) {
      const patch = {};
      for (const field of ["blocks", "sections", "heroImage", "previewImage"]) {
        if (d[field] && swap({ x: d[field] } ) ) patch[field] = d[field];
      }
      if (Object.keys(patch).length) {
        await client.patch(d._id).set(patch).commit();
        docsPatched++;
      }
    }
  }

  await client
    .transaction()
    .createIfNotExists({ _id: "sectionsMigration", _type: "migrationState" })
    .patch("sectionsMigration", (p) => p.set({ hdVersion: HD_VERSION }))
    .commit();
  console.log(`[hd] done: ${upgraded} upgraded, ${kept} already sharp, ${failed} no better rendition; ${docsPatched} docs repointed`);
}

main()
  .catch((e) => console.error(`[hd] failed (non-fatal): ${e.message}`))
  .finally(() => process.exit(0));
