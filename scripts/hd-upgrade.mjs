/**
 * HD image upgrade v2. The July harvest saved the small renditions listed in
 * each old-portfolio page's markup; the ORIGINAL un-resized files live in the
 * same markup as lightbox `data-src` URLs (each with its own signed ?h=
 * token — which is why rewriting rendition URLs failed in v1).
 *
 * For every project with an old-site page (Peaches is rebuilt separately by
 * sections-migrate): re-fetch the page, read the lightbox originals in module
 * order, and — where the project still references a scraped asset narrower
 * than MIN_OK_WIDTH — upload the matching original and repoint the reference.
 * Mapping is positional (n-th scraped image ↔ n-th lightbox module) and only
 * applied when the counts agree, so nothing gets mismatched. Layouts and
 * Studio edits are untouched.
 *
 * Guarded by hdVersion on the `sectionsMigration` doc; fail-soft (exit 0).
 */
import { createClient } from "@sanity/client";
import fs from "node:fs";

const HD_VERSION = 3; // v3: patch published docs explicitly (v2 may have landed on Studio drafts)
const MIN_OK_WIDTH = 1400;
const BASE = "https://nicoleavritch.myportfolio.com";
const SKIP_SLUGS = new Set(["lets-talk-peaches"]); // rebuilt from originals in sections-migrate

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

/* lightbox data-src URLs = the original files, in module (page) order */
function extractOriginals(html) {
  return [...html.matchAll(/class="js-lightbox"\s+data-src="(https:\/\/cdn\.myportfolio\.com\/[^"]+)"/g)].map((m) =>
    m[1].replace(/&amp;/g, "&")
  );
}

async function download(url) {
  const r = await fetch(url, { headers: UA });
  if (!r.ok) throw new Error(String(r.status));
  const buf = Buffer.from(await r.arrayBuffer());
  if (buf.length < 8000) throw new Error("too small");
  return buf;
}

/* collect image asset refs in document order (blocks, then sections) */
function collectRefs(node, out) {
  if (!node || typeof node !== "object") return;
  if (node.asset?._ref) out.push(node.asset._ref);
  for (const v of Object.values(node)) {
    if (Array.isArray(v)) v.forEach((x) => collectRefs(x, out));
    else if (v && typeof v === "object") collectRefs(v, out);
  }
}

async function main() {
  const state = (await client.fetch(`*[_id == "sectionsMigration"][0]`)) || {};
  if ((state.hdVersion || 0) >= HD_VERSION) {
    console.log(`[hd] up to date (v${state.hdVersion})`);
    return;
  }

  const seed = JSON.parse(fs.readFileSync("content/seed.json", "utf8"));
  let upgraded = 0, kept = 0, skippedProjects = 0;

  for (const p of seed.projects) {
    if (!p.oldSlug || SKIP_SLUGS.has(p.slug)) continue;

    const docsAll = await client.fetch(
      `*[_type == "project" && slug.current == $slug]{_id, blocks, sections, "isDraft": _id in path("drafts.**")}`,
      { slug: p.slug }
    );
    const doc = docsAll.find((d) => !d.isDraft) || docsAll[0];
    if (!doc) continue;

    /* scraped assets this doc actually references, in page order */
    const allRefs = [];
    collectRefs({ b: doc.blocks, s: doc.sections }, allRefs);
    const uniqueRefs = [...new Set(allRefs)];
    if (!uniqueRefs.length) continue;
    const assets = await client.fetch(
      `*[_type == "sanity.imageAsset" && _id in $ids]{_id, originalFilename, size, "w": metadata.dimensions.width}`,
      { ids: uniqueRefs }
    );
    const byId = new Map(assets.map((a) => [a._id, a]));
    const scrapedPattern = new RegExp(`^${p.slug}-\\d+\\.jpg$`);
    const scrapedRefs = uniqueRefs.filter((id) => scrapedPattern.test(byId.get(id)?.originalFilename || ""));
    if (!scrapedRefs.length) continue;

    let originals;
    try {
      originals = extractOriginals(await getPage(`${BASE}/${p.oldSlug}`));
    } catch (e) {
      console.warn(`[hd] ${p.slug}: page fetch failed (${e.message})`);
      continue;
    }
    if (originals.length !== scrapedRefs.length) {
      console.warn(`[hd] ${p.slug}: ${scrapedRefs.length} scraped refs vs ${originals.length} lightbox originals — skipping (unsafe mapping)`);
      skippedProjects++;
      continue;
    }

    const refMap = new Map();
    for (let i = 0; i < scrapedRefs.length; i++) {
      const a = byId.get(scrapedRefs[i]);
      if ((a.w || 0) >= MIN_OK_WIDTH) { kept++; continue; }
      try {
        const buf = await download(originals[i]);
        if (buf.length <= (a.size || 0)) { kept++; continue; }
        const fn = `${p.slug}-orig-${String(i + 1).padStart(2, "0")}.jpg`;
        const found = await client.fetch(
          `*[_type == "sanity.imageAsset" && originalFilename == $fn && size == $size][0]{_id}`,
          { fn, size: buf.length }
        );
        const id = found?._id || (await client.assets.upload("image", buf, { filename: fn }))._id;
        refMap.set(scrapedRefs[i], id);
        upgraded++;
      } catch (e) {
        console.warn(`[hd] ${p.slug} #${i + 1}: ${e.message}`);
      }
    }

    if (refMap.size) {
      const swap = (node) => {
        if (!node || typeof node !== "object") return;
        if (node.asset?._ref && refMap.has(node.asset._ref)) {
          node.asset = { _type: "reference", _ref: refMap.get(node.asset._ref) };
        }
        for (const v of Object.values(node)) {
          if (Array.isArray(v)) v.forEach(swap);
          else if (v && typeof v === "object") swap(v);
        }
      };
      for (const d of docsAll) {
        const patch = {};
        if (d.blocks) { swap({ x: d.blocks }); patch.blocks = d.blocks; }
        if (d.sections) { swap({ x: d.sections }); patch.sections = d.sections; }
        if (Object.keys(patch).length) await client.patch(d._id).set(patch).commit();
      }
      console.log(`[hd] ${p.slug}: ${refMap.size} images upgraded to originals (${docsAll.map((d) => d._id).join(", ")})`);
    }
  }

  await client
    .transaction()
    .createIfNotExists({ _id: "sectionsMigration", _type: "migrationState" })
    .patch("sectionsMigration", (p) => p.set({ hdVersion: HD_VERSION }))
    .commit();
  console.log(`[hd] done: ${upgraded} upgraded, ${kept} already fine, ${skippedProjects} projects skipped`);
}

main()
  .catch((e) => console.error(`[hd] failed (non-fatal): ${e.message}`))
  .finally(() => process.exit(0));
