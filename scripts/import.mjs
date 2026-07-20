/**
 * Imports scraped content + seed copy into Sanity.
 * Idempotent: documents use deterministic _ids (createOrReplace);
 * image assets are reused when an asset with the same originalFilename+size exists.
 * Env: SANITY_TOKEN (required). Runs in GitHub Actions.
 */
import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "2h8pgj67";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const token = process.env.SANITY_TOKEN;
if (!token) {
  console.error("SANITY_TOKEN env var is required");
  process.exit(1);
}

const client = createClient({ projectId, dataset, token, apiVersion: "2024-10-01", useCdn: false });
const seed = JSON.parse(fs.readFileSync("content/seed.json", "utf8"));
const SCRAPED = "content/scraped";

/* ---------- ensure dataset exists ---------- */
try {
  const datasets = await client.datasets.list();
  if (!datasets.find((d) => d.name === dataset)) {
    console.log(`[import] creating dataset '${dataset}'`);
    await client.datasets.create(dataset, { aclMode: "public" });
  }
} catch (e) {
  console.warn(`[import] could not verify/create dataset (may need higher token permissions): ${e.message}`);
}

/* ---------- asset upload with reuse ---------- */
const assetCache = new Map();
async function uploadImage(filePath) {
  if (assetCache.has(filePath)) return assetCache.get(filePath);
  const buf = fs.readFileSync(filePath);
  const filename = path.basename(path.dirname(filePath)) + "-" + path.basename(filePath);
  const existing = await client.fetch(
    `*[_type == "sanity.imageAsset" && originalFilename == $fn && size == $size][0]{_id}`,
    { fn: filename, size: buf.length }
  );
  let id;
  if (existing?._id) {
    id = existing._id;
  } else {
    const asset = await client.assets.upload("image", buf, { filename });
    id = asset._id;
  }
  const ref = { _type: "image", asset: { _type: "reference", _ref: id } };
  assetCache.set(filePath, ref);
  return ref;
}

function readScraped(slug) {
  const f = path.join(SCRAPED, `${slug}.json`);
  return fs.existsSync(f) ? JSON.parse(fs.readFileSync(f, "utf8")) : null;
}

const color = (hex) => ({ _type: "color", hex, alpha: 1 });
const key = (s) => ({ _key: s });

/* ---------- site settings ---------- */
const aboutScraped = readScraped("_about");
const scrapedSocials = new Set();
for (const pg of ["_about", ...seed.projects.map((p) => p.slug)]) {
  const sc = readScraped(pg);
  sc?.socials?.forEach((s) => {
    if (s.includes("instagram.com")) scrapedSocials.add(JSON.stringify({ label: "Instagram", url: s.split("?")[0] }));
  });
}
const socials = [
  ...seed.siteSettings.socials,
  ...[...scrapedSocials].map((s) => JSON.parse(s)),
].map((s, i) => ({ ...s, _key: `social-${i}` }));

await client.createOrReplace({
  _id: "siteSettings",
  _type: "siteSettings",
  siteTitle: seed.siteSettings.siteTitle,
  tagline: seed.siteSettings.tagline,
  heroLine: seed.siteSettings.heroLine,
  email: seed.siteSettings.email,
  socials,
  fontPairing: "editorial",
  colorBackground: color("#F5EFE3"),
  colorInk: color("#09201B"),
  colorAccent: color("#EB3D00"),
  colorAccent2: color("#F9B122"),
  colorSurface: color("#ECDFAB"),
});
console.log("[import] siteSettings ✓");

/* ---------- about page ---------- */
let portrait;
const aboutHero = aboutScraped?.downloads?.find((d) => d.isHero) || aboutScraped?.downloads?.[0];
if (aboutHero && fs.existsSync(aboutHero.file)) portrait = await uploadImage(aboutHero.file);

await client.createOrReplace({
  _id: "aboutPage",
  _type: "aboutPage",
  headline: seed.about.headline,
  bio: seed.about.bio,
  ...(portrait ? { portrait } : {}),
  experience: seed.about.experience.map((e, i) => ({ ...e, _key: `exp-${i}` })),
  skills: seed.about.skills,
  recognition: seed.about.recognition,
});
console.log("[import] aboutPage ✓");

/* ---------- projects ---------- */
function convertExtraBlock(b, slug, i) {
  if (b.type === "statsRow")
    return {
      _type: "statsRow",
      _key: `${slug}-extra-${i}`,
      stats: b.stats.map((s, j) => ({ ...s, _key: `${slug}-stat-${i}-${j}` })),
    };
  if (b.type === "logoList")
    return { _type: "logoList", _key: `${slug}-extra-${i}`, heading: b.heading, items: b.items };
  if (b.type === "textSection")
    return { _type: "textSection", _key: `${slug}-extra-${i}`, heading: b.heading, body: b.body };
  return null;
}

const summary = [];
for (const p of seed.projects) {
  const scraped = readScraped(p.slug);
  const downloads = scraped?.downloads || [];
  const heroDl = downloads.find((d) => d.isHero) || downloads[0];
  const galleryDls = downloads.filter((d) => d !== heroDl);

  let heroImage;
  if (heroDl && fs.existsSync(heroDl.file)) heroImage = await uploadImage(heroDl.file);

  const galleryRefs = [];
  for (const d of galleryDls) {
    if (!fs.existsSync(d.file)) continue;
    try {
      galleryRefs.push(await uploadImage(d.file));
    } catch (e) {
      console.warn(`[import] upload failed ${d.file}: ${e.message}`);
    }
  }

  const blocks = [];
  // curated blocks first (stats, guest lists, extra copy)
  (p.extraBlocks || []).forEach((b, i) => {
    const cb = convertExtraBlock(b, p.slug, i);
    if (cb) blocks.push(cb);
  });
  // then video embeds
  const videos = [...new Set(scraped?.videos || [])];
  videos.forEach((v, i) => {
    blocks.push({ _type: "videoEmbed", _key: `${p.slug}-vid-${i}`, url: v });
  });
  // then image gallery in grids of 6
  for (let i = 0; i < galleryRefs.length; i += 6) {
    blocks.push({
      _type: "imageGrid",
      _key: `${p.slug}-grid-${i}`,
      columns: 2,
      images: galleryRefs.slice(i, i + 6).map((r, j) => ({ ...r, _key: `${p.slug}-img-${i}-${j}` })),
    });
  }

  await client.createOrReplace({
    _id: `project-${p.slug}`,
    _type: "project",
    title: p.title,
    slug: { _type: "slug", current: p.slug },
    featured: !!p.featured,
    order: p.order,
    client: p.client,
    year: p.year,
    role: p.role,
    tags: p.tags,
    intro: p.intro,
    ...(heroImage ? { heroImage } : {}),
    blocks,
  });
  summary.push({ slug: p.slug, images: galleryRefs.length + (heroImage ? 1 : 0), videos: videos.length, blocks: blocks.length });
  console.log(`[import] project ${p.slug} ✓ (${galleryRefs.length + (heroImage ? 1 : 0)} images, ${videos.length} videos)`);
}

fs.mkdirSync("content/status", { recursive: true });
fs.writeFileSync(
  "content/status/import-report.json",
  JSON.stringify({ when: new Date().toISOString(), projects: summary }, null, 2)
);
console.log("[import] done");
