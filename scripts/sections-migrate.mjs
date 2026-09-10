/**
 * One-time, guarded migration: restructures the LIVE Independent Pet Partners
 * document's flat blocks into named, drag-orderable `sections` (the new
 * table-of-contents case-study layout). Runs on Vercel after the seeder.
 *
 * Unlike a reseed, this operates on the CURRENT document in Sanity — it moves
 * existing blocks (Studio edits included) into sections; anything it cannot
 * classify lands in a "More" section rather than being dropped. The original
 * flat `blocks` array is backed up (as JSON) onto the migration-state doc
 * before being cleared.
 *
 * Version-guarded via the `sectionsMigration` doc: bump IPP_SECTIONS_VERSION
 * only for a deliberate re-run (a re-run REBUILDS sections from the current
 * blocks/sections content and discards manual section re-ordering in Studio).
 * Fail-soft: always exits 0.
 */
import { createClient } from "@sanity/client";

const IPP_SECTIONS_VERSION = 1;
const SLUG = "independent-pet-partners";

const IS_VERCEL = !!process.env.VERCEL;
const token = process.env.SANITY_TOKEN;
if (!IS_VERCEL || !token) {
  console.log("[sections] skipped (not a Vercel build or SANITY_TOKEN not set)");
  process.exit(0);
}

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "2h8pgj67";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
const client = createClient({ projectId, dataset, token, apiVersion: "2024-10-01", useCdn: false });

async function main() {
  const state = (await client.fetch(`*[_id == "sectionsMigration"][0]`)) || {};
  await migrateIpp(state);
  await migratePeaches(state);
}

async function migrateIpp(state) {
  if ((state.ippVersion || 0) >= IPP_SECTIONS_VERSION) {
    console.log(`[sections] IPP up to date (v${state.ippVersion})`);
    return;
  }

  const doc = await client.fetch(`*[_type == "project" && slug.current == $slug][0]`, { slug: SLUG });
  if (!doc) {
    console.log("[sections] IPP doc not found — nothing to migrate");
    return;
  }
  const blocks = doc.blocks || [];
  if (!blocks.length && (doc.sections || []).length) {
    console.log("[sections] IPP already sectioned with no flat blocks — marking done");
    await markDone();
    return;
  }

  /* map image asset refs -> original filenames, to classify PDF spreads */
  const refs = new Set();
  for (const b of blocks) {
    if (b._type === "fullBleedImage" && b.image?.asset?._ref) refs.add(b.image.asset._ref);
    if (b._type === "imageGrid") (b.images || []).forEach((im) => im?.asset?._ref && refs.add(im.asset._ref));
  }
  const assets = await client.fetch(`*[_type == "sanity.imageAsset" && _id in $ids]{_id, originalFilename}`, {
    ids: [...refs],
  });
  const fnOf = new Map(assets.map((a) => [a._id, a.originalFilename || ""]));
  const pdfNum = (ref) => {
    const m = (fnOf.get(ref) || "").match(/-pdf-(\d+)\.\w+$/);
    return m ? Number(m[1]) : null;
  };

  /* buckets */
  const videos = [];
  let auaHeader = null; // "Ask Us Anything" heading stays with the shoot chapter
  let auaText = null;
  let brandSystemsText = null;
  const stills = [], illos = [], print = [], marketing = [], inhouse = [], apparel = [];
  const inhouseFull = []; // e.g. the Roosevelt Graphis photo (fullBleed with caption)
  const unsorted = [];

  const classifyNum = (n) =>
    n === 1 ? print : n === 2 ? apparel : n === 3 ? inhouse : n === 4 ? marketing : n >= 5 && n <= 14 ? stills : n >= 15 && n <= 20 ? illos : null;

  for (const b of blocks) {
    switch (b._type) {
      case "videoEmbed":
        videos.push(b);
        break;
      case "sectionHeader":
        if (/ask us anything/i.test(b.heading || "")) auaHeader = b;
        else if (/brand systems/i.test(b.heading || "")) {
          /* superseded by the In-house brands section title */
        } else unsorted.push(b);
        break;
      case "textSection":
        if (/art directed this campaign|mood boards/i.test(b.body || "")) auaText = b;
        else if (/systems that keep the brand consistent|credentialing/i.test(b.body || "")) brandSystemsText = b;
        else unsorted.push(b);
        break;
      case "fullBleedImage": {
        const cap = b.caption || "";
        const fn = b.image?.asset?._ref ? fnOf.get(b.image.asset._ref) || "" : "";
        if (/graphis|roosevelt/i.test(cap) || /extraurl/.test(fn)) inhouseFull.push(b);
        else {
          const bucket = b.image?.asset?._ref ? classifyNum(pdfNum(b.image.asset._ref)) : null;
          if (bucket) bucket.push(b.image);
          else unsorted.push(b);
        }
        break;
      }
      case "imageGrid":
        for (const im of b.images || []) {
          const bucket = im?.asset?._ref ? classifyNum(pdfNum(im.asset._ref)) : null;
          if (bucket) bucket.push(im);
          else unsorted.push({ _type: "fullBleedImage", _key: `ipp-un-${unsorted.length}`, image: im });
        }
        break;
      default:
        unsorted.push(b);
    }
  }

  /* builders */
  let k = 0;
  const key = () => `ipp-sec-${IPP_SECTIONS_VERSION}-${k++}`;
  const img = (im) => ({ ...im, _key: im._key || key() });
  const grid = (ims, columns = 2) =>
    ims.length ? [{ _type: "imageGrid", _key: key(), columns, images: ims.map(img) }] : [];
  const imgBlocks = (ims) =>
    ims.length === 1 ? [{ _type: "fullBleedImage", _key: key(), image: img(ims[0]) }] : grid(ims, 2);
  const rekey = (b) => ({ ...b, _key: key() });

  const sections = [
    {
      _type: "projectSection",
      _key: key(),
      title: "Brand shoot + assets",
      blocks: [
        ...videos.map(rekey),
        ...(auaHeader ? [rekey(auaHeader)] : []),
        ...(auaText ? [rekey(auaText)] : []),
        ...grid(stills, 2),
        ...grid(illos, 3),
      ],
    },
    { _type: "projectSection", _key: key(), title: "Print", blocks: imgBlocks(print) },
    { _type: "projectSection", _key: key(), title: "Web design", blocks: [] },
    { _type: "projectSection", _key: key(), title: "Marketing", blocks: imgBlocks(marketing) },
    {
      _type: "projectSection",
      _key: key(),
      title: "In-house brands",
      blocks: [...(brandSystemsText ? [rekey(brandSystemsText)] : []), ...imgBlocks(inhouse), ...inhouseFull.map(rekey)],
    },
    { _type: "projectSection", _key: key(), title: "Apparel", blocks: imgBlocks(apparel) },
    ...(unsorted.length
      ? [{ _type: "projectSection", _key: key(), title: "More", blocks: unsorted.map(rekey) }]
      : []),
  ];

  await client
    .transaction()
    .createIfNotExists({ _id: "sectionsMigration", _type: "migrationState" })
    .patch("sectionsMigration", (p) =>
      p.set({ ippVersion: IPP_SECTIONS_VERSION, ippBlocksBackup: JSON.stringify(blocks) })
    )
    .patch(doc._id, (p) => p.set({ sections }).unset(["blocks"]))
    .commit();

  console.log(
    `[sections] IPP migrated → ${sections.length} sections ` +
      `(videos:${videos.length} stills:${stills.length} illos:${illos.length} print:${print.length} ` +
      `marketing:${marketing.length} inhouse:${inhouse.length + inhouseFull.length} apparel:${apparel.length} unsorted:${unsorted.length})`
  );
}

async function markDone() {
  await client
    .transaction()
    .createIfNotExists({ _id: "sectionsMigration", _type: "migrationState" })
    .patch("sectionsMigration", (p) => p.set({ ippVersion: IPP_SECTIONS_VERSION }))
    .commit();
}

/* ---- Let's Talk, Peaches: mirror her old-portfolio layout exactly ----
 * Old page order: explainer blurb (guest names linked to episodes) → the
 * old site's gallery images in original order → the campaign video.
 * The gallery assets already exist in Sanity (uploaded during the seed
 * harvest, then unused) — this references them without re-downloading. */
const PEACHES_LAYOUT_VERSION = 1;
const PEACHES_SLUG = "lets-talk-peaches";
const PEACHES_BLURB =
  "Co-founded a podcast brand where I designed the full visual identity, graphic template system, and website. " +
  "I art-directed episode graphics featuring guests including " +
  "[Puno](https://podcasts.apple.com/us/podcast/lets-talk-creatives-business-and-female/id1523122912?i=1000564475608), " +
  "[Zipeng Zhu](https://podcasts.apple.com/us/podcast/lets-talk-taking-risks-living-boldly-learning-to-lead/id1523122912?i=1000548082274), " +
  "Taylor Rae Roman, " +
  "[Jeffery Marsh](https://podcasts.apple.com/us/podcast/lets-talk-radical-self-acceptance-spirituality-with/id1523122912?i=1000557882134), " +
  "and Alicia Sinclair. The podcast grew to over 40K streams.";

async function migratePeaches(state) {
  if ((state.peachesVersion || 0) >= PEACHES_LAYOUT_VERSION) {
    console.log(`[sections] peaches up to date (v${state.peachesVersion})`);
    return;
  }
  const doc = await client.fetch(`*[_type == "project" && slug.current == $slug][0]`, { slug: PEACHES_SLUG });
  if (!doc) {
    console.log("[sections] peaches doc not found — nothing to migrate");
    return;
  }

  const assets = await client.fetch(
    `*[_type == "sanity.imageAsset" && originalFilename match "lets-talk-peaches-*"]{_id, originalFilename, size}`
  );
  const gallery = assets
    .filter((a) => /^lets-talk-peaches-\d+\.jpg$/.test(a.originalFilename || ""))
    .sort((a, b) => (a.originalFilename || "").localeCompare(b.originalFilename || "", undefined, { numeric: true }));
  // the old page repeats some tiles via lazy-load; drop byte-identical dupes
  const seen = new Set();
  const unique = gallery.filter((a) => (seen.has(a.size) ? false : (seen.add(a.size), true)));
  if (unique.length < 4) {
    console.log(`[sections] peaches: only ${unique.length} old-site gallery assets found — skipping, needs re-harvest`);
    return;
  }

  const vids = (doc.blocks || []).filter((b) => b._type === "videoEmbed");
  let k = 0;
  const key = () => `peach-v${PEACHES_LAYOUT_VERSION}-${k++}`;
  const blocks = [
    { _type: "textSection", _key: key(), body: PEACHES_BLURB },
    {
      _type: "imageGrid",
      _key: key(),
      columns: 2,
      images: unique.map((a) => ({ _type: "image", _key: key(), asset: { _type: "reference", _ref: a._id } })),
    },
    ...(vids.length
      ? vids.map((v) => ({ ...v, _key: key() }))
      : [
          {
            _type: "videoEmbed",
            _key: key(),
            url: "https://www-ccv.adobe.io/v1/player/ccv/CB62sbnIIEp/embed?bgcolor=%23191919&api_key=BehancePro2View",
          },
        ]),
  ];

  await client
    .transaction()
    .createIfNotExists({ _id: "sectionsMigration", _type: "migrationState" })
    .patch("sectionsMigration", (p) =>
      p.set({
        peachesVersion: PEACHES_LAYOUT_VERSION,
        peachesBackup: JSON.stringify({ blocks: doc.blocks || [], intro: doc.intro || "", hideHero: !!doc.hideHero }),
      })
    )
    .patch(doc._id, (p) => p.set({ blocks, hideHero: true }).unset(["intro", "sections"]))
    .commit();
  console.log(`[sections] peaches migrated → old-portfolio layout (${unique.length} images, ${Math.max(vids.length, 1)} video)`);
}

main()
  .catch((e) => console.error(`[sections] failed (non-fatal): ${e.message}`))
  .finally(() => process.exit(0));
