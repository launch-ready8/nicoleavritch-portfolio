/**
 * Runs automatically before `next build` ON VERCEL ONLY (npm "prebuild").
 * Seeds Sanity with Nicole's content from two sources:
 *  1. content/pdf-assets/  — curated spreads extracted from her portfolio PDF (in the repo)
 *  2. her old Adobe Portfolio site — full-res gallery images + video embeds via raw HTML
 * Fail-soft (always exits 0) and versioned: bumps SEED_VERSION to reseed on deploy.
 * Requires env: SANITY_TOKEN.
 */
import { createClient } from "@sanity/client";
import fs from "node:fs";
import path from "node:path";

/*
 * ⚠️  WARNING: a reseed REBUILDS every document from seed.json and the harvest,
 * which OVERWRITES any edits made by hand in the Sanity Studio. Once Nicole is
 * editing in the Studio, do NOT bump SEED_VERSION — make content changes in
 * the Studio instead. Only bump for a deliberate full reset.
 */
const SEED_VERSION = 4; // bump to force a reseed on next deploy (see warning above)

const IS_VERCEL = !!process.env.VERCEL;
const token = process.env.SANITY_TOKEN;
if (!IS_VERCEL || !token) {
  console.log("[seed] skipped (not a Vercel build or SANITY_TOKEN not set)");
  process.exit(0);
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "2h8pgj67";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const BASE = "https://nicoleavritch.myportfolio.com";
const MAX_SCRAPED_PER_PROJECT = 24;
const MIN_IMAGE_BYTES = 15000; // drops favicons / tiny logo marks

const client = createClient({ projectId, dataset, token, apiVersion: "2024-10-01", useCdn: false });

async function main() {
  const seed = JSON.parse(fs.readFileSync("content/seed.json", "utf8"));

  try {
    const datasets = await client.datasets.list();
    if (!datasets.find((d) => d.name === dataset)) await client.datasets.create(dataset, { aclMode: "public" });
  } catch (e) {
    console.warn(`[seed] dataset check: ${e.message}`);
  }

  /* CORS for the studio */
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

  /* versioned idempotency */
  const status = await client.fetch(`*[_id == "seedStatus"][0]{version}`).catch(() => null);
  if ((status?.version || 0) >= SEED_VERSION && process.env.FORCE_RESEED !== "1") {
    console.log(`[seed] already at version ${status.version}, skipping`);
    return;
  }

  const UA = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0 Safari/537.36" };
  async function getPage(url) {
    const r = await fetch(url, { headers: UA });
    if (!r.ok) throw new Error(`${r.status} for ${url}`);
    return await r.text();
  }

  function extractImages(html) {
    const all = [...html.matchAll(/https:\/\/cdn\.myportfolio\.com\/[^"'\s\\)]+?\.(?:jpe?g|png|gif|webp)(?:\?[^"'\s\\)]*)?/gi)].map((m) => m[0].replace(/&amp;/g, "&"));
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
  async function uploadBuffer(buf, name) {
    const found = await client.fetch(
      `*[_type == "sanity.imageAsset" && originalFilename == $fn && size == $size][0]{_id}`,
      { fn: name, size: buf.length }
    );
    const id = found?._id || (await client.assets.upload("image", buf, { filename: name }))._id;
    return { _type: "image", asset: { _type: "reference", _ref: id } };
  }
  async function uploadFromUrl(url, name) {
    if (assetCache.has(url)) return assetCache.get(url);
    const r = await fetch(url, { headers: UA });
    if (!r.ok) throw new Error(`download ${r.status}`);
    const buf = Buffer.from(await r.arrayBuffer());
    if (buf.length < MIN_IMAGE_BYTES && !url.includes(".gif")) throw new Error(`too small (${buf.length}b), likely an icon`);
    const ref = await uploadBuffer(buf, name);
    assetCache.set(url, ref);
    return ref;
  }
  async function uploadLocalDir(slug) {
    const dir = path.join("content/pdf-assets", slug);
    if (!fs.existsSync(dir)) return [];
    const refs = [];
    for (const f of fs.readdirSync(dir).sort()) {
      try {
        refs.push(await uploadBuffer(fs.readFileSync(path.join(dir, f)), `${slug}-pdf-${f}`));
      } catch (e) {
        console.warn(`[seed] local ${slug}/${f}: ${e.message}`);
      }
    }
    return refs;
  }

  /* ---- site settings (palette from Nicole's approved color cards) ---- */
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
    colorBackground: color("#FDFCF9"),
    colorInk: color("#09201B"),
    colorAccent: color("#EB3D00"),
    colorAccent2: color("#F9B122"),
    colorSurface: color("#ECDFAB"),
  });
  console.log("[seed] siteSettings ✓");

  /* ---- about: headshot from the repo (her portfolio PDF cover) ---- */
  let portrait;
  try {
    const local = await uploadLocalDir("about");
    portrait = local[0];
  } catch (e) {
    console.warn(`[seed] headshot: ${e.message}`);
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
    if (b.type === "logoList") return { _type: "logoList", _key: `${slug}-extra-${i}`, heading: b.heading, people: (b.people || (b.items || []).map((n) => ({ name: n }))).map((x, j) => ({ ...x, _key: `${slug}-person-${i}-${j}` })) };
    if (b.type === "textSection") return { _type: "textSection", _key: `${slug}-extra-${i}`, heading: b.heading, body: b.body };
    if (b.type === "sectionHeader") return { _type: "sectionHeader", _key: `${slug}-extra-${i}`, kicker: b.kicker, heading: b.heading };
    return null;
  }

  for (const p of seed.projects) {
    try {
      let heroImage;
      let scraped = [];
      let videos = [];

      // curated PDF spreads first: this is her own layout work, it leads the page
      const pdfRefs = await uploadLocalDir(p.slug);

      if (p.oldSlug) {
        try {
          const html = await getPage(`${BASE}/${p.oldSlug}`);
          const og = extractOg(html);
          const urls = extractImages(html).filter((u) => u !== og).slice(0, MAX_SCRAPED_PER_PROJECT);
          videos = extractVideos(html);
          if (og) {
            try { heroImage = await uploadFromUrl(og, `${p.slug}-hero.jpg`); } catch (e) { console.warn(`[seed] hero ${p.slug}: ${e.message}`); }
          }
          for (let i = 0; i < urls.length; i++) {
            try { scraped.push(await uploadFromUrl(urls[i], `${p.slug}-${String(i + 1).padStart(2, "0")}.jpg`)); }
            catch (e) { console.warn(`[seed] img ${p.slug}#${i}: ${e.message}`); }
          }
        } catch (e) {
          console.warn(`[seed] old site ${p.slug}: ${e.message}`);
        }
      }
      if (!heroImage && pdfRefs.length) heroImage = pdfRefs[0];

      // Order: intro blocks → campaign video(s) → her PDF spreads → follow-up blocks → old-site galleries
      const blocks = [];
      (p.extraBlocks || []).forEach((b, i) => {
        const cb = convertExtraBlock(b, p.slug, i);
        if (cb) blocks.push(cb);
      });
      videos.forEach((v, i) => blocks.push({ _type: "videoEmbed", _key: `${p.slug}-vid-${i}`, url: v }));
      const lead = pdfRefs.filter((r) => r !== heroImage);
      for (let i = 0; i < lead.length; i += 6) {
        blocks.push({
          _type: "imageGrid", _key: `${p.slug}-pdfgrid-${i}`, columns: 2,
          images: lead.slice(i, i + 6).map((r, j) => ({ ...r, _key: `${p.slug}-pdfimg-${i}-${j}` })),
        });
      }
      for (let i = 0; i < (p.extraBlocksAfter || []).length; i++) {
        const b = p.extraBlocksAfter[i];
        if (b.type === "imageUrls") {
          for (let j = 0; j < (b.urls || []).length; j++) {
            try {
              const ref = await uploadFromUrl(b.urls[j], `${p.slug}-extraurl-${i}-${j}.jpg`);
              blocks.push({ _type: "fullBleedImage", _key: `${p.slug}-exturl-${i}-${j}`, image: ref, caption: b.caption });
            } catch (e) {
              console.warn(`[seed] imageUrls ${p.slug}: ${e.message}`);
            }
          }
          continue;
        }
        const cb = convertExtraBlock(b, p.slug, 100 + i);
        if (cb) blocks.push(cb);
      }
      if (p.skipScrapedGallery) scraped = [];
      for (let i = 0; i < scraped.length; i += 6) {
        blocks.push({
          _type: "imageGrid", _key: `${p.slug}-grid-${i}`, columns: 2,
          images: scraped.slice(i, i + 6).map((r, j) => ({ ...r, _key: `${p.slug}-img-${i}-${j}` })),
        });
      }

      await client.createOrReplace({
        _id: `project-${p.slug}`,
        _type: "project",
        title: p.title,
        slug: { _type: "slug", current: p.slug },
        featured: !!p.featured,
        order: p.order,
        orderRank: `0|${String.fromCharCode(96 + p.order)}00000:`,
        client: p.client,
        year: p.year,
        role: p.role,
        tags: p.tags,
        intro: p.intro,
        ...(heroImage ? { heroImage } : {}),
        blocks,
      });
      console.log(`[seed] ${p.slug} ✓ (${pdfRefs.length} pdf + ${scraped.length} scraped images, ${videos.length} videos)`);
    } catch (e) {
      console.warn(`[seed] project ${p.slug} FAILED: ${e.message}`);
    }
  }

  await client.createOrReplace({ _id: "seedStatus", _type: "seedStatus", version: SEED_VERSION });
  console.log(`[seed] done, version ${SEED_VERSION}`);
}

try {
  await main();
} catch (e) {
  console.error(`[seed] fatal (deploy continues): ${e.message}`);
}
process.exit(0);
