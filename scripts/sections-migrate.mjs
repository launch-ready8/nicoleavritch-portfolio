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
  await migrateTagline(state);
  await schemaSync(state);
}

/* Amanda (Oct 2026): the Studio must mirror the live site exactly. Removes
 * stored values whose fields no longer render anywhere (and were removed from
 * the schema in the same deploy), plus IPP's invisible "More" section, which
 * held only hidden stats blocks. Touches nothing the site displays. */
const SCHEMA_SYNC_VERSION = 2;
async function schemaSync(state) {
  if ((state.schemaSyncVersion || 0) >= SCHEMA_SYNC_VERSION) {
    console.log(`[sections] schema-sync up to date (v${state.schemaSyncVersion})`);
    return;
  }

  // 1) About: opener headline (page section removed) + unused experience summaries
  const aboutDocs = await client.fetch(`*[_type == "aboutPage"]{_id}`);
  for (const d of aboutDocs) {
    await client.patch(d._id).unset(["headline", "experience[].summary"]).commit();
  }

  // 2) Site settings: stale "Get to know me" label (pub + any draft)
  const settingsDocs = await client.fetch(`*[_type == "siteSettings"]{_id}`);
  for (const d of settingsDocs) {
    await client.patch(d._id).unset(["labels.getToKnowMe"]).commit();
  }

  // 2b) projects: the cover image no longer renders on project pages, so the
  //     "hide cover" toggle is gone — clear its stored values everywhere
  const projDocs = await client.fetch(`*[_type == "project" && defined(hideHero)]{_id}`);
  for (const d of projDocs) {
    await client.patch(d._id).unset(["hideHero"]).commit();
  }

  // 3) IPP: drop the "More" section if it still holds nothing visible
  const ippDocs = await client.fetch(`*[_type == "project" && slug.current == "independent-pet-partners"]{_id, sections}`);
  for (const d of ippDocs) {
    if (!d.sections) continue;
    const pruned = d.sections.filter(
      (s) => !(s.title === "More" && (s.blocks || []).every((b) => b._type === "statsRow"))
    );
    if (pruned.length !== d.sections.length) {
      await client.patch(d._id).set({ sections: pruned }).commit();
      console.log(`[sections] schema-sync: removed invisible "More" section from ${d._id}`);
    }
  }

  await client
    .transaction()
    .createIfNotExists({ _id: "sectionsMigration", _type: "migrationState" })
    .patch("sectionsMigration", (p) => p.set({ schemaSyncVersion: SCHEMA_SYNC_VERSION }))
    .commit();
  console.log(`[sections] schema-sync v${SCHEMA_SYNC_VERSION} done (about: ${aboutDocs.length}, settings: ${settingsDocs.length})`);
}

/* Amanda (Sep 2026): homepage should read "Creative Direction and Design". */
const TAGLINE_VERSION = 1;
async function migrateTagline(state) {
  if ((state.taglineVersion || 0) >= TAGLINE_VERSION) {
    console.log(`[sections] tagline up to date (v${state.taglineVersion})`);
    return;
  }
  await client
    .transaction()
    .createIfNotExists({ _id: "sectionsMigration", _type: "migrationState" })
    .patch("sectionsMigration", (p) => p.set({ taglineVersion: TAGLINE_VERSION }))
    .patch("siteSettings", (p) => p.set({ tagline: "Creative Direction and Design" }))
    .commit();
  console.log(`[sections] tagline set → "Creative Direction and Design"`);
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

/* ---- Let's Talk, Peaches: mirror her old-portfolio page EXACTLY ----
 * Verified against the live old page markup (Sep 2026): header description →
 * eight full-width stacked image modules → the campaign video → one final
 * image. The lightbox data-src URLs below are the ORIGINAL un-resized files
 * (each carries its own signed ?h= token), so this also fixes the blur that
 * came from the old harvest's small renditions. */
const PEACHES_LAYOUT_VERSION = 3; // v3: patch published doc explicitly (v2 landed on a Studio draft)
const PEACHES_SLUG = "lets-talk-peaches";
const PEACHES_CDN = "https://cdn.myportfolio.com/d16c8cbd2ff15d87315ef646e6ee0d96";
const PEACHES_ORIGINALS = [
  "8974f336-b948-45e0-ad7f-acfa16d71e66.jpg?h=35ab42345a92ff49ed7831214579d47d",
  "a014b963-d174-4403-8e4a-ec16eafa076b.jpg?h=fdcafad55b4466723517ba55a427d4b0",
  "dff7c216-38ed-4dd5-b09d-6bcac202c76c.jpg?h=ade42bd87f4485347b1e233836b31420",
  "9c89b0c9-ac0e-4f78-89b8-79c5d3d792d4.jpg?h=7dab0bfe410a35fd5bfbd9f80f4fb4bd",
  "183bc6cf-73d7-485e-9d96-0bad1a5fe4ed.jpg?h=50a1c46552bb8bfa930be3785ee7d9a3",
  "6ab03b15-a64a-4357-93d8-aa99691af62f.jpg?h=b502a5992baac64eef9ec027645013e8",
  "b1d719c7-6096-4cf9-95da-d192dd6a2872.jpg?h=bac7892e6b515ae165e112bb1b1ebe8a",
  "bcad1b50-7965-4097-b8cf-e7a08fa2aa3e.jpg?h=e03e82e7fc8ec25b66ecc432ebcf2da9",
  // ---- the video module sits here on the old page ----
  "fc4cb902-3ac2-4fff-960d-62a553b8ca28.jpg?h=cfe818a5ac9a063cc696329cc6a263a3",
];
const PEACHES_VIDEO_AFTER = 8; // number of images before the video module
const PEACHES_VIDEO_URL =
  "https://www-ccv.adobe.io/v1/player/ccv/CB62sbnIIEp/embed?bgcolor=%23191919&lazyLoading=true&api_key=BehancePro2View";
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
  /* authenticated fetches see Studio drafts too — patch published AND any
     draft, so the live site changes now and a later "Publish" can't revert it */
  const docs = await client.fetch(`*[_type == "project" && slug.current == $slug]{..., "isDraft": _id in path("drafts.**")}`, { slug: PEACHES_SLUG });
  const doc = docs.find((d) => !d.isDraft) || docs[0];
  if (!doc) {
    console.log("[sections] peaches doc not found — nothing to migrate");
    return;
  }
  console.log(`[sections] peaches targets: ${docs.map((d) => d._id).join(", ")}`);

  const UA = { "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/126.0 Safari/537.36" };
  const refs = [];
  for (let i = 0; i < PEACHES_ORIGINALS.length; i++) {
    const url = `${PEACHES_CDN}/${PEACHES_ORIGINALS[i]}`;
    const fn = `lets-talk-peaches-orig-${String(i + 1).padStart(2, "0")}.jpg`;
    try {
      const r = await fetch(url, { headers: UA });
      if (!r.ok) throw new Error(String(r.status));
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length < 8000) throw new Error("too small");
      const found = await client.fetch(
        `*[_type == "sanity.imageAsset" && originalFilename == $fn && size == $size][0]{_id}`,
        { fn, size: buf.length }
      );
      const id = found?._id || (await client.assets.upload("image", buf, { filename: fn }))._id;
      refs.push(id);
    } catch (e) {
      console.warn(`[sections] peaches original #${i + 1}: ${e.message}`);
      refs.push(null);
    }
  }
  const got = refs.filter(Boolean).length;
  if (got < PEACHES_ORIGINALS.length - 2) {
    console.log(`[sections] peaches: only ${got}/${PEACHES_ORIGINALS.length} originals downloadable — aborting, keeping current page`);
    return;
  }

  let k = 0;
  const key = () => `peach-v${PEACHES_LAYOUT_VERSION}-${k++}`;
  const img = (id) => ({ _type: "fullBleedImage", _key: key(), image: { _type: "image", asset: { _type: "reference", _ref: id } } });
  const blocks = [{ _type: "textSection", _key: key(), body: PEACHES_BLURB }];
  refs.slice(0, PEACHES_VIDEO_AFTER).forEach((id) => id && blocks.push(img(id)));
  blocks.push({ _type: "videoEmbed", _key: key(), url: PEACHES_VIDEO_URL });
  refs.slice(PEACHES_VIDEO_AFTER).forEach((id) => id && blocks.push(img(id)));

  await client
    .transaction()
    .createIfNotExists({ _id: "sectionsMigration", _type: "migrationState" })
    .patch("sectionsMigration", (p) =>
      p.set({
        peachesVersion: PEACHES_LAYOUT_VERSION,
        peachesBackup2: JSON.stringify({ blocks: doc.blocks || [], intro: doc.intro || "", hideHero: !!doc.hideHero }),
      })
    )
    .commit();
  for (const d of docs) {
    await client.patch(d._id).set({ blocks, hideHero: true }).unset(["intro", "sections"]).commit();
    console.log(`[sections] peaches patched ${d._id}`);
  }
  console.log(`[sections] peaches migrated v3 → exact old-portfolio layout (${got} original images, video after #${PEACHES_VIDEO_AFTER})`);
}

main()
  .catch((e) => console.error(`[sections] failed (non-fatal): ${e.message}`))
  .finally(() => process.exit(0));
