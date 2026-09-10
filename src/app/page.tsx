import Link from "next/link";
import Image from "next/image";
import { getProjects, getSettings, urlFor } from "@/lib/sanity";
import Ticker from "@/components/Ticker";
import Reveal from "@/components/Reveal";
import HeroEllipse from "@/components/HeroEllipse";
import ViewAllBand from "@/components/ViewAllBand";
import HoverIndex from "@/components/HoverIndex";

export const revalidate = 60;

export default async function Home() {
  const [settings, projects] = await Promise.all([getSettings(), getProjects()]);
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  const [first = "Nicole", last = "Avritch"] = settings.siteTitle.split(" ");
  const L = settings.labels || {};
  const tagline = settings.tagline || "Creative Direction and Design";
  const tm = tagline.match(/^(.*?)\s+(&|and)\s+(.*)$/i);
  const [tagA, tagConn, tagB] = tm ? [tm[1], tm[2], tm[3]] : [tagline, "", ""];
  const viewAll = L.seeAllWork || "View all work";

  /* *word* in the hero sentence renders in the accent color */
  const accented = (t: string) =>
    t.split(/(\*[^*]+\*)/g).map((p, i) =>
      p.startsWith("*") && p.endsWith("*") ? (
        <span key={i} style={{ color: "var(--accent)" }}>
          {p.slice(1, -1)}
        </span>
      ) : (
        <span key={i}>{p}</span>
      )
    );

  const indexRows = rest.map((p, i) => ({
    id: p._id,
    title: p.title,
    slug: p.slug,
    tag: p.tags?.[0],
    num: String(i + featured.length + 1).padStart(2, "0"),
    img:
      p.previewImage || p.heroImage
        ? urlFor(p.previewImage || p.heroImage).width(600).fit("max").url()
        : null,
  }));

  return (
    <div id="top">
      {/* HERO — layered editorial composition: statement top-left, massive
          name, tagline + expertise index sharing the base line */}
      <section className="mx-auto max-w-[1500px] px-5 pt-6 pb-14 md:px-10 md:pt-8 md:pb-20">
        {settings.heroLine && (
          <p className="max-w-[19rem] text-[0.8rem] font-semibold uppercase leading-[1.7] tracking-[0.09em] md:max-w-sm md:text-[0.92rem]">
            {accented(settings.heroLine)}
          </p>
        )}
        <h1 className="display relative mt-5 md:mt-2">
          <span className="block text-right text-[19vw] leading-[0.88] md:text-[14vw]">{first}</span>
          <span className="block text-[19vw] leading-[0.88] md:text-[14vw]">{last}</span>
        </h1>
        <div className="mt-4 md:mt-6">
          <p className="text-[7.5vw] leading-[1.08] tracking-tight md:text-[3.4vw]">
            (<span className="relative inline-block">
              {tagA.trim()}
              <HeroEllipse />
            </span>
            {tagConn && (
              <>
                <br />
                {tagConn} {tagB.trim()})
              </>
            )}
            {!tagConn && ")"}
          </p>
        </div>
      </section>

      <Ticker
        items={
          settings.tickerItems?.length
            ? settings.tickerItems
            : ["Brand identity", "Creative direction", "Campaigns", "Packaging", "Retail", "Motion"]
        }
      />

      {/* FEATURED — restrained scale, side by side on desktop */}
      <section className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24">
        <p className="label mb-8">
          <span
            className="inline-block px-2.5 py-1.5"
            style={{ background: "var(--accent)", color: "var(--background)" }}
          >
            {L.selectedWork || "Selected work"}
          </span>
        </p>
        <div className="grid gap-12 md:grid-cols-2 md:gap-10">
          {featured.map((p, i) => (
            <Reveal key={p._id} delay={i * 0.1}>
              <Link href={`/work/${p.slug}`} className="group block">
                <div className="img-zoom relative aspect-[4/3] w-full overflow-hidden">
                  {p.heroImage ? (
                    <Image
                      src={urlFor(p.heroImage).width(1400).fit("max").url()}
                      alt={p.title}
                      fill
                      priority={i === 0}
                      sizes="(min-width: 768px) 45vw, 95vw"
                      className="object-cover"
                    />
                  ) : (
                    <div className="h-full w-full" style={{ background: i % 2 ? "var(--ink)" : "var(--accent)" }} />
                  )}
                </div>
                <div className="mt-3 flex items-baseline justify-between">
                  <span className="text-2xl font-medium transition-colors group-hover:text-accent md:text-3xl">
                    {p.title}
                  </span>
                  <span className="num">{p.year}</span>
                </div>
                {p.tags && <p className="label mt-1 opacity-70">{p.tags.slice(0, 3).join(" · ")}</p>}
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* VIEW ALL WORK — clickable slider band right under the featured pair */}
      <ViewAllBand text={viewAll.replace(/\s*→\s*$/, "")} />

      {/* QUIET INDEX with cursor image previews */}
      {rest.length > 0 && (
        <section className="mx-auto max-w-[1500px] px-5 py-16 pb-24 md:px-10">
          <p className="label mb-5 opacity-70">{L.moreProjects || "More projects"}</p>
          <HoverIndex rows={indexRows} />
          <div className="mt-10">
            <Link href="/work" className="big-link group inline-flex items-baseline gap-3">
              <span>{viewAll.replace(/\s*→\s*$/, "")}</span>
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1.5">
                →
              </span>
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
