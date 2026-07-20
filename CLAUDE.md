# Nicole Avritch Portfolio — Project Guide for AI Sessions

This file is the onboarding doc for any future Claude (or other AI) session working on this project. Read it fully before changing anything.

## What this is

A portfolio site for Nicole Avritch (Creative Director & Senior Designer), built by Amanda Figueroa (amanda@launchreadymarketing.com) with Claude. Design direction: the structure and motion of juliefreund.dk (airy paper ground, staggered hero name with hand-drawn orange doodles, word-by-word text reveals, scroll-drifting work rows, per-page color-field footer) with Nicole's palette and content.

- **Live site:** https://nicoleavritch-portfolio-mvr9.vercel.app
- **CMS Studio:** https://nicoleavritch-portfolio-mvr9.vercel.app/studio
- **Repo:** github.com/launch-ready8/nicoleavritch-portfolio
- **Stack:** Next.js (App Router) + Tailwind v4 + Sanity CMS (project `2h8pgj67`, dataset `production`) + Vercel (Git auto-deploy)

## Golden rules

1. **Content lives in Sanity, not in code.** Copy/image changes should be made in the Studio at `/studio`, not by editing this repo. Publishing in the Studio is live within ~60s (ISR revalidate).
2. **NEVER bump `SEED_VERSION` in `scripts/vercel-seed.mjs` casually.** A reseed rebuilds every Sanity document from `content/seed.json` and destroys any edits Nicole or Amanda made by hand in the Studio. Only reseed as a deliberate full reset, with Amanda's explicit OK.
3. **Design changes are code changes**: edit, build locally (`npm run build`), push to `main`. Vercel auto-deploys every push.
4. Fonts are self-hosted via @fontsource (Google Fonts is NOT fetched at build). The display face is Anton; body is Archivo Variable; mono is IBM Plex Mono. Font pairing is switchable in the CMS.
5. The palette comes from Nicole's approved color cards and is CMS-driven: ink #09201B, cream #ECDFAB, marigold #F9B122, green #1B7754, tangerine accent #EB3D00, warm paper background. Read them from Site Settings; don't hardcode new colors.

## Layout of the code

- `src/app/` — pages: home (`page.tsx`), `work/` (scroll-drifting rows), `work/[slug]/` (case study), `about/`, `studio/` (embedded Sanity Studio), `not-found.tsx`
- `src/components/` — `Doodle` (hand-drawn SVG ornaments, draw-in on scroll), `WordReveal`, `Ticker`, `ScrollRow`, `SmartImage` (natural aspect ratios + animated GIF passthrough), `BlockRenderer` (case-study block types), `Nav`, `Footer` (color changes per route), `Reveal`
- `src/sanity/schemaTypes/` — `project` (with block array: sectionHeader, textSection, fullBleedImage, imageGrid, videoEmbed, statsRow, logoList), `aboutPage`, `siteSettings` (incl. Look & Feel theme panel)
- `scripts/vercel-seed.mjs` — build-time content seeder (see warning above). Runs only on Vercel via npm `prebuild`.
- `content/seed.json` — the seed content (copy voice: first person, plain, few words, minimal em dashes, real numbers only)
- `content/pdf-assets/` — curated spreads extracted from Nicole's own portfolio PDF, uploaded to Sanity by the seeder

## Local development

`MOCK_CONTENT=1 npm run dev` renders sample content without Sanity access (useful in sandboxes where sanity.io is unreachable). Never set MOCK_CONTENT in production.

## Environment / access

- Vercel project `nicoleavritch-portfolio` under Amanda's account; env var `SANITY_TOKEN` set there (used only by the seeder).
- Sandbox environments may block sanity.io / vercel.com / myportfolio.com — network-dependent steps run on Vercel at build time instead.

## Known follow-ups

- Replace Adobe/Behance video embeds with proper files once Nicole uploads the Ask Us Anything cutdowns (:30/:15/:06) to Drive.
- Custom domain when Amanda is ready (Vercel → Settings → Domains).
- Nicole should be invited to the Sanity project (manage.sanity.io → Members, Editor role).
- Editing guide for Nicole lives outside the repo (Amanda has it).
