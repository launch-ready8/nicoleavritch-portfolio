/**
 * Scrapes nicoleavritch.myportfolio.com with a real browser (Playwright)
 * to recover lazy-loaded gallery images that plain fetches can't see.
 * Runs in GitHub Actions (full network). Outputs content/scraped/.
 */
import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const BASE = "https://nicoleavritch.myportfolio.com";
const seed = JSON.parse(fs.readFileSync("content/seed.json", "utf8"));
const OUT = "content/scraped";
fs.mkdirSync(path.join(OUT, "assets"), { recursive: true });

const pages = [
  ...seed.projects.map((p) => ({ slug: p.slug, url: `${BASE}/${p.oldSlug}` })),
  { slug: "_about", url: `${BASE}/about-1` },
];

function pickLargestFromSrcset(srcset) {
  try {
    const parts = srcset.split(",").map((s) => s.trim().split(/\s+/));
    parts.sort((a, b) => (parseInt(b[1]) || 0) - (parseInt(a[1]) || 0));
    return parts[0][0];
  } catch {
    return null;
  }
}

const browser = await chromium.launch();
const ctx = await browser.newContext({
  userAgent:
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36",
  viewport: { width: 1600, height: 1000 },
});

const report = [];

for (const pg of pages) {
  const page = await ctx.newPage();
  const entry = { slug: pg.slug, url: pg.url, images: [], videos: [], socials: [], paragraphs: [], heroImage: null, errors: [] };
  try {
    await page.goto(pg.url, { waitUntil: "networkidle", timeout: 60000 });
    // slow auto-scroll to trigger lazy loading
    await page.evaluate(async () => {
      await new Promise((resolve) => {
        let total = 0;
        const step = 600;
        const timer = setInterval(() => {
          window.scrollBy(0, step);
          total += step;
          if (total >= document.body.scrollHeight + 2000) {
            clearInterval(timer);
            resolve();
          }
        }, 250);
      });
    });
    await page.waitForTimeout(2500);

    entry.heroImage = await page
      .locator('meta[property="og:image"]')
      .first()
      .getAttribute("content")
      .catch(() => null);

    const imgs = await page.evaluate(() => {
      return Array.from(document.querySelectorAll("img")).map((img) => ({
        src: img.currentSrc || img.src || "",
        srcset: img.getAttribute("srcset") || "",
        w: img.naturalWidth,
        h: img.naturalHeight,
      }));
    });
    const urls = new Set();
    for (const im of imgs) {
      let u = im.srcset ? pickLargestFromSrcset(im.srcset) : null;
      u = u || im.src;
      if (!u || !u.includes("cdn.myportfolio.com")) continue;
      if (im.w > 0 && im.w < 200 && im.h > 0 && im.h < 200) continue; // skip icons
      urls.add(u);
    }
    entry.images = [...urls];

    entry.videos = await page.evaluate(() =>
      Array.from(document.querySelectorAll("iframe, video source, video"))
        .map((el) => el.src || el.getAttribute("src") || "")
        .filter(Boolean)
    );

    entry.socials = await page.evaluate(() =>
      Array.from(document.querySelectorAll("a"))
        .map((a) => a.href)
        .filter((h) => /instagram\.com|facebook\.com|linkedin\.com|behance\.net/.test(h))
    );

    entry.paragraphs = await page.evaluate(() =>
      Array.from(document.querySelectorAll("p, h1, h2, h3"))
        .map((el) => el.innerText.trim())
        .filter((t) => t.length > 0)
    );

    // download images
    const dir = path.join(OUT, "assets", pg.slug);
    fs.mkdirSync(dir, { recursive: true });
    let i = 0;
    const downloads = [];
    const all = entry.heroImage ? [entry.heroImage, ...entry.images.filter((u) => u !== entry.heroImage)] : entry.images;
    for (const u of all) {
      i += 1;
      const clean = u.split("?")[0];
      const ext = (clean.match(/\.(jpe?g|png|gif|webp)$/i) || [null, "jpg"])[1].toLowerCase();
      const file = path.join(dir, `${String(i).padStart(2, "0")}.${ext}`);
      try {
        const resp = await ctx.request.get(u, { timeout: 60000 });
        if (resp.ok()) {
          fs.writeFileSync(file, Buffer.from(await resp.body()));
          downloads.push({ url: u, file, isHero: u === entry.heroImage });
        } else {
          entry.errors.push(`download ${resp.status()}: ${u}`);
        }
      } catch (e) {
        entry.errors.push(`download failed: ${u} — ${e.message}`);
      }
    }
    entry.downloads = downloads;
  } catch (e) {
    entry.errors.push(`page failed: ${e.message}`);
  }
  fs.writeFileSync(path.join(OUT, `${pg.slug}.json`), JSON.stringify(entry, null, 2));
  report.push({ slug: pg.slug, images: entry.images.length, videos: entry.videos.length, errors: entry.errors.length });
  console.log(`[scrape] ${pg.slug}: ${entry.images.length} images, ${entry.videos.length} videos, ${entry.errors.length} errors`);
  await page.close();
}

await browser.close();
fs.writeFileSync(path.join(OUT, "_report.json"), JSON.stringify(report, null, 2));
console.log("[scrape] done");
