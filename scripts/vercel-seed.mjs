/**
 * Runs automatically before `next build` ON VERCEL ONLY (npm "prebuild").
 * Seeds Sanity with Nicole's content: harvests images + video embeds from her
 * old Adobe Portfolio site (raw-HTML regex — Vercel builders have full network),
 * uploads them to Sanity, and creates all documents from content/seed.json.
 *
 * Fail-soft by design: any error logs and exits 0 so the site still deploys.
 * Idempotent: skips seeding when projects already exist (override: FORCE_RESEED=1).
 * Requires env: SANITY_TOKEN. No-ops everywhere except Vercel builds.
 */
import { createClient } from "@sanity/client";
import fs from "node:fs";

const IS_VERCEL = !!process.env.VERCEL;
const token = process.env.SANITY_TOKEN;

if (!IS_VERCEL || !token) {
  console.log("[seed] skipped (not a Vercel build or SANITY_TOKEN not set)");
  process.exit(0);
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "2h8pgj67";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const BASE = "https://nicoleavritch.myportfolio.com";
const MAX_IMAGES_PER_PROJECT = 30;

const client = createClient({ projectId, dataset, token, apiVersion: "2024-10-01", useCdn: false });

async function main() {
  const seed = JSON.parse(fs.readFileSync("content/seed.json", "utf8"));

  /* ---- ensure dataset ---- */
  try {
    const datasets = await client.datasets.list();
    if (!datasets.find((d) => d.name === dataset)) {
      console.log(`[seed] creating dataset '${dataset}'`);
      await client.datasets.create(dataset, { aclMode: "public" });
    }
  } catch (e) {
    console.warn(`[seed] dataset check: ${e.message}`);
  }

  /* ---- CORS for the studio (best-effort) ---- */
  const origins = ["http://localhost:3000"];
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) origins.push(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`);
  if (process.env.VERCEL_URL) origins.push(`https://${process.env.VERCEL_URL}`);
  for (const origin of [...new Set(origins)]) {
    try {
      const r = await fetch(`https://api.sanity.io/v2021-06-07/projects/${projectId}/cors`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ origin, allowCredentials: true }),
      });
      console.log(`[seed] cors ${origin}: ${r.status}`);
    } catch (e) {
      console.warn(`[seed] cors ${origin}: ${e.message}`);
    }
  }

  /* ---- idempotency ---- */
  const existing = await client.fetch(`count(*[_type == "project"])`);
  if (existing >= seed.projects.length && process.env.FORCE_RESEED !== "1") {
    console.log(`[seed] ${existing} projects already in Sanity — skipping (set FORCE_RESEED=1 to redo)`);
    return;
  }

  /* ---- harvest helpers ---- */
  const UA = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0 Safari/537.36" };

  async function getPage(url) {
    const r = await fetch(url, { headers: UA });
    if (!r.ok) throw new Error(`${r.status} for ${url}`);
    return await r.text();
  }

  function extractImages(html) {
    // every cdn.myportfolio.com asset URL in the raw HTML (src, srcset, data-src, embedded JSON)
    const all = [...html.matchAll(/https:\/\/cdn\.myportfolio\.com\/[^"'\s\\)]+?\.(?:jpe?g|png|gif|webp)(?:\?[^"'\s\\)]*)?/gi)].map((m) => m[0].replace(/&amp;/g, "&"));
    // group by asset uuid, keep the largest rendition
    const groups = new Map();
    for (const u of all) {
      const idMatch = u.match(/([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i);
      const key = idMatch ? idMatch[1] : u.split("?")[0];
      const width = (() => {
        const rw = u.match(/_rw_(\d+)/);
        if (rw) return parseInt(rw[1]);
        const rwc = u.match(/_rwc_\d+x\d+x(\d+)/);
        if (rwc) return parseInt(rwc[1]);
        return 1000; // unknown rendition — treat as decent
      })();
      const cur = groups.get(key);
      if (!cur || width > cur.width) groups.set(key, { url: u, width });
    }
    return [...groups.values()].filter((g) => g.width >= 400).map((g) => g.url);
  }

  function extractVideos(html) {
    const srcs = [...html.matchAll(/<iframe[^>]+src=["']([^"']+)["']/gi)].map((m) => m[1].replace(/&amp;/g, "&"));
    return [...new Set(srcs.filter((s) => /adobe|behance|ccv|youtube|vimeo/i.test(s)))];
  }

  function extractOg(html) {
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    return m ? m[1].replace(/&amp;/g, "&") : null;
  }

  const assetCache = new Map();
  async function uploadFromUrl(url, name) {
    if (assetCache.has(url)) return assetCache.get(url);
    const r = await fetch(url, { headers: UA });
    if (!r.ok) throw new Error(`download ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    const found = await client.fetch(
      `*[_type == "sanity.imageAsset" && originalFilename == $fn && size == $size][0]{_id}`,
      { fn: name, size: buf.length }
    );
    const id = found?._id || (await client.assets.upload("image", buf, { filename: name }))._id;
    const ref = { _type: "image", asset: { _type: "reference", _ref: id } };
    assetCache.set(url, ref);
    return ref;
  }

  /* ---- site settings ---- */
  const color = (hex) => ({ _type: "color", hex, alpha: 1 });
  await client.createOrReplace({
    _id: "siteSettings",
    _type: "siteSettings",
    siteTitle: seed.siteSettings.siteTitle,
    tagline: seed.siteSettings.tagline,
    heroLine: seed.siteSettings.heroLine,
    email: seed.siteSettings.email,
    socials: seed.siteSettings.socials.map((s, i) => ({ ...s, _key: `social-${i}` })),
    fontPairing: "editorial",
    colorBackground: color("#FAF7F0"),
    colorInk: color("#10201C"),
    colorAccent: color("#EB3D00"),
    colorAccent2: color("#F9B122"),
    colorSurface: color("#1B7754"),
  });
  console.log("[seed] siteSettings ✓");

  /* ---- about (portrait from old about page) ---- */
  let portrait;
  try {
    const aboutHtml = await getPage(`${BASE}/about-1`);
    const og = extractOg(aboutHtml);
    if (og) portrait = await uploadFromUrl(og, "about-portrait.jpg");
  } catch (e) {
    console.warn(`[seed] about portrait: ${e.message}`);
  }
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
  console.log("[seed] aboutPage ✓");

  /* ---- projects ---- */
  function convertExtraBlock(b, slug, i) {
    if (b.type === "statsRow")
      return { _type: "statsRow", _key: `${slug}-extra-${i}`, stats: b.stats.map((s, j) => ({ ...s, _key: `${slug}-stat-${i}-${j}` })) };
    if (b.type === "logoList") return { _type: "logoList", _key: `${slug}-extra-${i}`, heading: b.heading, items: b.items };
    if (b.type === "textSection") return { _type: "textSection", _key: `${slug}-extra-${i}`, heading: b.heading, body: b.body };
    return null;
  }

  for (const p of seed.projects) {
    try {
      const html = await getPage(`${BASE}/${p.oldSlug}`);
      const og = extractOg(html);
      const imgUrls = extractImages(html).filter((u) => u !== og).slice(0, MAX_IMAGES_PER_PROJECT);
      const videos = extractVideos(html);

      let heroImage;
      if (og) {
        try {
          heroImage = await uploadFromUrl(og, `${p.slug}-hero.jpg`);
        } catch (e) {
          console.warn(`[seed] hero ${p.slug}: ${e.message}`);
        }
      }

      const gallery = [];
      for (let i = 0; i < imgUrls.length; i++) {
        try {
          gallery.push(await uploadFromUrl(imgUrls[i], `${p.slug}-${String(i + 1).padStart(2, "0")}.jpg`));
        } catch (e) {
          console.warn(`[seed] img ${p.slug}#${i}: ${e.message}`);
        }
      }

      const blocks = [];
      (p.extraBlocks || []).forEach((b, i) => {
        const cb = convertExtraBlock(b, p.slug, i);
        if (cb) blocks.push(cb);
      });
      videos.forEach((v, i) => blocks.push({ _type: "videoEmbed", _key: `${p.slug}-vid-${i}`, url: v }));
      for (let i = 0; i < gallery.length; i += 6) {
        blocks.push({
          _type: "imageGrid",
          _key: `${p.slug}-grid-${i}`,
          columns: 2,
          images: gallery.slice(i, i + 6).map((r, j) => ({ ...r, _key: `${p.slug}-img-${i}-${j}` })),
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
      console.log(`[seed] ${p.slug} ✓ (${gallery.length + (heroImage ? 1 : 0)} images, ${videos.length} videos)`);
    } catch (e) {
      console.warn(`[seed] project ${p.slug} FAILED: ${e.message}`);
    }
  }
  console.log("[seed] done");
}

try {
  await main();
} catch (e) {
  console.error(`[seed] fatal (deploy continues): ${e.message}`);
}
process.exit(0);
