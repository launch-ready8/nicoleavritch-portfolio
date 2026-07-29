import { createClient } from "next-sanity";
import { createImageUrlBuilder } from "@sanity/image-url";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type SanityImageSource = any;
import { projectId, dataset, apiVersion } from "@/sanity/env";

export const client = createClient({
  projectId,
  dataset,
  apiVersion,
  // Fresh reads: page-level ISR (revalidate) already caches, and fresh data
  // matters on the first build right after seeding.
  useCdn: false,
});

const builder = createImageUrlBuilder(client);
export const urlFor = (source: SanityImageSource) => builder.image(source);

/* ---------- Theme ---------- */

export type Theme = {
  background: string;
  ink: string;
  accent: string;
  accent2: string;
  surface: string;
  fontPairing: "editorial" | "poster" | "grotesque";
  headlineGoogleFont?: string;
  bodyGoogleFont?: string;
  headlineFontUrl?: string;
  bodyFontUrl?: string;
};

export const DEFAULT_THEME: Theme = {
  background: "#F1ECE1",
  ink: "#141414",
  accent: "#FB4A1E",
  accent2: "#FB4A1E",
  surface: "#E7E1D3",
  fontPairing: "editorial",
};

export type SiteSettings = {
  siteTitle: string;
  tagline?: string;
  heroLine?: string;
  email?: string;
  phone?: string;
  tickerItems?: string[];
  labels?: Record<string, string | undefined>;
  socials?: { label: string; url: string }[];
  theme: Theme;
};

const settingsQuery = `*[_type == "siteSettings"][0]{
  siteTitle, tagline, heroLine, email, phone, tickerItems, labels, socials,
  "background": coalesce(colorBackground.hex, colorBackground),
  "ink": coalesce(colorInk.hex, colorInk),
  "accent": coalesce(colorAccent.hex, colorAccent),
  "accent2": coalesce(colorAccent2.hex, colorAccent2),
  "surface": coalesce(colorSurface.hex, colorSurface),
  fontPairing,
  headlineGoogleFont, bodyGoogleFont,
  "headlineFontUrl": headlineFontFile.asset->url,
  "bodyFontUrl": bodyFontFile.asset->url
}`;

export async function getSettings(): Promise<SiteSettings> {
  if (process.env.MOCK_CONTENT === "1")
    return {
      siteTitle: "Nicole Avritch",
      tagline: "Creative Director & Senior Designer",
      heroLine:
        "I lead brand creative for consumer brands, from first brief to final asset: identity, campaigns, packaging, retail, and motion.",
      email: "nicoleavritch@gmail.com",
            socials: [{ label: "LinkedIn", url: "#" }, { label: "Instagram", url: "#" }],
      theme: DEFAULT_THEME,
    };
  try {
    const s = await client.fetch(settingsQuery, {}, { next: { revalidate: 60 } });
    return {
      siteTitle: s?.siteTitle || "Nicole Avritch",
      tagline: s?.tagline || "Senior Designer & Brand Strategist",
      heroLine: s?.heroLine || undefined,
      email: s?.email || undefined,
      phone: s?.phone || undefined,
      tickerItems: s?.tickerItems || [],
      labels: s?.labels || {},
      socials: s?.socials || [],
      theme: {
        background: s?.background || DEFAULT_THEME.background,
        ink: s?.ink || DEFAULT_THEME.ink,
        accent: s?.accent || DEFAULT_THEME.accent,
        accent2: s?.accent2 || DEFAULT_THEME.accent2,
        surface: s?.surface || DEFAULT_THEME.surface,
        fontPairing: s?.fontPairing || DEFAULT_THEME.fontPairing,
        headlineGoogleFont: s?.headlineGoogleFont || undefined,
        bodyGoogleFont: s?.bodyGoogleFont || undefined,
        headlineFontUrl: s?.headlineFontUrl || undefined,
        bodyFontUrl: s?.bodyFontUrl || undefined,
      },
    };
  } catch {
    return {
      siteTitle: "Nicole Avritch",
      tagline: "Senior Designer & Brand Strategist",
      socials: [],
      theme: DEFAULT_THEME,
    };
  }
}

/* ---------- Projects ---------- */

export type ProjectCard = {
  _id: string;
  title: string;
  slug: string;
  client?: string;
  year?: string;
  tags?: string[];
  featured?: boolean;
  heroImage?: SanityImageSource;
  intro?: string;
};

export type ProjectFull = ProjectCard & {
  role?: string;
  hideHero?: boolean;
  credits?: string;
  blocks?: Block[];
};

export type Block =
  | { _type: "sectionHeader"; _key: string; kicker?: string; heading?: string }
  | { _type: "textSection"; _key: string; heading?: string; body?: string }
  | { _type: "fullBleedImage"; _key: string; image?: SanityImageSource; caption?: string }
  | { _type: "imageGrid"; _key: string; images?: SanityImageSource[]; columns?: number }
  | { _type: "videoEmbed"; _key: string; url?: string; caption?: string }
  | { _type: "statsRow"; _key: string; stats?: { value?: string; label?: string }[] }
  | { _type: "logoList"; _key: string; heading?: string; items?: string[]; people?: { name?: string; url?: string }[] };

const cardFields = `_id, title, "slug": slug.current, client, year, tags, featured, heroImage, intro`;

/* Local design-preview mode: `MOCK_CONTENT=1 npm run dev` renders sample
   content without needing Sanity. Never set in production. */
const MOCK = process.env.MOCK_CONTENT === "1";
const mockProjects: ProjectFull[] = [
  {
    _id: "m1",
    title: "Let's Talk, Peaches",
    slug: "lets-talk-peaches",
    client: "Let's Talk, Peaches",
    year: "2020 – 2023",
    role: "Co-Founder, Brand & Design",
    tags: ["Podcast Brand", "Visual Identity", "Art Direction"],
    featured: true,
    intro:
      "I co-founded Let's Talk, Peaches and designed the whole thing — the visual identity, a graphic template system that kept every episode on-brand, and the website.",
    blocks: [
      {
        _type: "statsRow",
        _key: "s1",
        stats: [
          { value: "40K+", label: "streams" },
          { value: "3", label: "years on air" },
          { value: "5", label: "seasons of graphics" },
        ],
      },
      {
        _type: "logoList",
        _key: "l1",
        heading: "Featured guests — listen in",
        people: [
          { name: "Puno", url: "#" },
          { name: "Zipeng Zhu", url: "#" },
          { name: "Jeffery Marsh", url: "#" },
        ],
      },
      {
        _type: "textSection",
        _key: "t1",
        heading: "A system, not a logo",
        body: "Every episode needed artwork fast — so the identity was built as a template system.\n\nBold type, a punchy palette, and rules loose enough to keep it fun.",
      },
    ],
  },
  {
    _id: "m2",
    title: "Independent Pet Partners",
    slug: "independent-pet-partners",
    year: "2019 – Present",
    tags: ["Brand Campaigns", "360° Campaign"],
    featured: true,
    intro: "Sole in-house designer for a multi-brand pet-wellness retailer.",
  },
  { _id: "m3", title: "Ubbi", slug: "ubbi", year: "2018 – 2019", tags: ["Packaging"], featured: false },
  { _id: "m4", title: "Neon Cheetah", slug: "neon-cheetah", tags: ["Brand Identity"], featured: false },
  { _id: "m5", title: "Party Depot", slug: "party-depot", tags: ["Rebrand"], featured: false },
  { _id: "m6", title: "Motion", slug: "motion", tags: ["After Effects"], featured: false },
];

export async function getProjects(): Promise<ProjectCard[]> {
  if (MOCK) return mockProjects;
  try {
    return await client.fetch(
      `*[_type == "project" && defined(slug.current)] | order(orderRank asc, order asc, _createdAt asc){${cardFields}}`,
      {},
      { next: { revalidate: 60 } }
    );
  } catch {
    return [];
  }
}

export async function getProject(slug: string): Promise<ProjectFull | null> {
  if (MOCK) return mockProjects.find((p) => p.slug === slug) || null;
  try {
    return await client.fetch(
      `*[_type == "project" && slug.current == $slug][0]{${cardFields}, role, intro, credits, blocks, hideHero}`,
      { slug },
      { next: { revalidate: 60 } }
    );
  } catch {
    return null;
  }
}

/* ---------- About ---------- */

export type About = {
  headline?: string;
  bio?: string;
  software?: string;
  portrait?: SanityImageSource;
  experience?: { company?: string; role?: string; dates?: string; summary?: string }[];
  skills?: string[];
  recognition?: string[];
};

export async function getAbout(): Promise<About | null> {
  if (MOCK)
    return {
      headline: "Catch me directing photo shoots where the talent has four legs or watching Gilmore Girls or something silly like that.",
      bio: "I'm Nicole — a Senior Designer and Brand Strategist with nine years of experience.\n\nMy background is in consumer brands, with a growing focus on health, wellness, and lifestyle.",
      experience: [
        { company: "Independent Pet Partners", role: "Senior Designer", dates: "2019 – Present", summary: "Sole in-house designer." },
        { company: "Let's Talk, Peaches", role: "Co-Founder & Designer", dates: "2020 – 2023" },
      ],
      skills: ["Brand Systems", "Campaign Design", "Art Direction", "Packaging"],
      recognition: ["Graphis Design Award, Silver (2021)"],
    };
  try {
    return await client.fetch(
      `*[_type == "aboutPage"][0]`,
      {},
      { next: { revalidate: 60 } }
    );
  } catch {
    return null;
  }
}
