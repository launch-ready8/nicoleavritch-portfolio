import Link from "next/link";
import Image from "next/image";
import { getProjects, getSettings, urlFor } from "@/lib/sanity";
import Ticker from "@/components/Ticker";
import Reveal from "@/components/Reveal";
import WordReveal from "@/components/WordReveal";

export const revalidate = 60;

export default async function Home() {
  const [settings, projects] = await Promise.all([getSettings(), getProjects()]);
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  const [first = "Nicole", last = "Avritch"] = settings.siteTitle.split(" ");
  const L = settings.labels || {};
  const taglineParts = (settings.tagline || "Creative Director & Senior Designer").split(/\s*&\s*/);

  return (
    <div id="top">
      {/* HERO */}
      <section className="mx-auto max-w-[1500px] px-5 pt-6 md:px-10">
        <h1 className="display relative">
          <span className="block text-right text-[19vw] leading-[0.88] md:text-[14vw]">{first}</span>
          <span className="block text-[19vw] leading-[0.88] md:text-[14vw]">{last}</span>
        </h1>
        <div className="relative mt-2 md:mt-4">
          <p className="text-[8vw] leading-[1.05] tracking-tight md:text-[5vw]">
            (<span className="relative inline-block">
              {taglineParts[0]?.trim()}
              <svg
                className="pointer-events-none absolute -inset-x-[5%] -inset-y-[14%] h-[128%] w-[110%] text-accent"
                viewBox="0 0 300 100"
                preserveAspectRatio="none"
                fill="none"
                aria-hidden
              >
                <ellipse cx="150" cy="50" rx="147" ry="46" stroke="currentColor" strokeWidth="2.5" />
              </svg>
            </span>
            <br />
            &amp; {taglineParts[1]?.trim().toLowerCase()})
          </p>
        </div>
      </section>

      {/* INTRO */}
      {settings.heroLine && (
        <section className="mx-auto max-w-[1500px] px-5 py-20 md:px-10 md:py-28">
          <div className="relative mx-auto max-w-2xl md:ml-[38%]">
            <svg className="absolute -left-24 top-1 hidden h-12 w-12 text-accent md:block" viewBox="0 0 100 100" fill="none" aria-hidden>
              <path d="M50 4 V96 M8 50 H92 M20 20 L80 80 M80 20 L20 80" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
            </svg>
            <WordReveal text={settings.heroLine} className="text-2xl leading-snug md:text-4xl" />
          </div>
        </section>
      )}

      <Ticker
        items={
          settings.tickerItems?.length
            ? settings.tickerItems
            : ["Brand identity", "Creative direction", "Campaigns", "Packaging", "Retail", "Motion"]
        }
      />

      {/* FEATURED — restrained scale, side by side on desktop */}
      <section className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24">
        <p className="label mb-8 opacity-50">{L.selectedWork || "Selected work"}</p>
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
                {p.tags && <p className="label mt-1 opacity-50">{p.tags.slice(0, 3).join(" · ")}</p>}
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* QUIET INDEX */}
      {rest.length > 0 && (
        <section className="mx-auto max-w-[1500px] px-5 pb-24 md:px-10">
          <p className="label mb-5 opacity-50">{L.moreProjects || "More projects"}</p>
          <div className="border-t rule">
            {rest.map((p, i) => {
              const rowTones = [{ c: "var(--ink)", t: "var(--background)" }];
              return (
                <Link
                  key={p._id}
                  href={`/work/${p.slug}`}
                  className="work-row flex items-baseline justify-between py-3.5"
                  style={{ "--row-c": rowTones[0].c, "--row-t": rowTones[0].t } as React.CSSProperties}
                >
                  <span className="flex items-baseline gap-4">
                    <span className="num text-accent opacity-100">
                      {String(i + featured.length + 1).padStart(2, "0")}
                    </span>
                    <span className="text-lg md:text-2xl">{p.title}</span>
                  </span>
                  <span className="label opacity-50">{p.tags?.[0]}</span>
                </Link>
              );
            })}
          </div>
          <div className="mt-8">
            <Link href="/work" className="stamp-btn">
              {L.seeAllWork || "See all work →"}
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
