import Link from "next/link";
import Image from "next/image";
import { getProjects, getSettings, urlFor, type ProjectCard as Card } from "@/lib/sanity";
import Marquee from "@/components/Marquee";
import Reveal from "@/components/Reveal";
import Star from "@/components/Star";

export const revalidate = 60;

function FeaturedSection({ project, index }: { project: Card; index: number }) {
  const schemes = [
    { bg: "var(--accent)", text: "var(--ink)" },
    { bg: "var(--ink)", text: "var(--background)" },
    { bg: "var(--surface)", text: "var(--ink)" },
  ];
  const scheme = schemes[index % schemes.length];
  return (
    <section style={{ background: scheme.bg, color: scheme.text }} className="border-b-2 rule">
      <div className="mx-auto max-w-[1700px] px-5 py-14 md:px-10 md:py-20">
        <Reveal>
          <div className="mb-8 flex items-center justify-between">
            <span className="num">{String(index + 1).padStart(2, "0")}</span>
            <span className="mono-label">{project.tags?.slice(0, 3).join(" / ")}</span>
          </div>
          <Link href={`/work/${project.slug}`} className="group block">
            <h2 className="display break-words text-[15vw] transition-transform duration-500 group-hover:translate-x-3 md:text-[9vw]">
              {project.title}
            </h2>
            <div className="mt-8 grid gap-6 md:grid-cols-[2fr_1fr]">
              <div className="img-zoom frame relative aspect-[16/9] overflow-hidden">
                {project.heroImage ? (
                  <Image
                    src={urlFor(project.heroImage).width(1800).fit("max").url()}
                    alt={project.title}
                    fill
                    sizes="(min-width: 768px) 60vw, 95vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <Star className="h-24 w-24 opacity-30" spin={false} />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-6">
                <div className="frame p-5">
                  <p className="mono-label mb-3 opacity-70">Year</p>
                  <p className="display text-3xl">{project.year || "—"}</p>
                </div>
                {project.intro && (
                  <p className="text-base leading-relaxed opacity-90 md:text-lg">{project.intro}</p>
                )}
                <span className="stamp-btn mt-auto self-start">Open case study →</span>
              </div>
            </div>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export default async function Home() {
  const [settings, projects] = await Promise.all([getSettings(), getProjects()]);
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  const nameParts = settings.siteTitle.split(" ");

  return (
    <div className="text-ink">
      {/* HERO */}
      <section className="relative overflow-hidden border-b-2 rule">
        <div className="mx-auto grid max-w-[1700px] grid-cols-[1fr_auto]">
          <div className="relative px-5 pb-8 pt-8 md:px-10 md:pt-12">
            <div className="mono-label mb-6 flex flex-wrap items-center gap-x-6 gap-y-2">
              <span className="flex items-center gap-2">
                <span className="inline-block h-2.5 w-2.5 bg-accent" />
                {settings.tagline}
              </span>
              <span className="opacity-60">Est. 2017</span>
            </div>
            <h1 className="display relative z-10 -ml-1 text-[20vw] md:text-[14.5vw]">
              {nameParts.map((part, i) => (
                <span key={part} className={`block ${i % 2 === 1 ? "md:pl-[8vw]" : ""}`}>
                  {part}
                </span>
              ))}
            </h1>
            <Star className="absolute right-[6%] top-[34%] z-20 h-[16vw] w-[16vw] text-accent md:right-[18%] md:top-[30%] md:h-[10vw] md:w-[10vw]" />
          </div>
          <div className="hidden items-stretch border-l-2 rule md:flex">
            <p className="vert mono-label flex items-center gap-4 px-4 py-8">
              Portfolio — {new Date().getFullYear()} <span className="text-accent">✦</span> Brand · Campaign · Motion
            </p>
          </div>
        </div>
        {settings.heroLine && (
          <div className="border-t-2 rule">
            <div className="mx-auto grid max-w-[1700px] md:grid-cols-2">
              <p className="mono-label border-b-2 rule px-5 py-5 leading-relaxed opacity-80 md:border-b-0 md:border-r-2 md:px-10">
                From strategic brief
                <br />→ to production
                <br />→ to final asset.
              </p>
              <p className="max-w-xl px-5 py-5 text-lg leading-snug md:px-10">{settings.heroLine}</p>
            </div>
          </div>
        )}
      </section>

      <Marquee items={["Brand Identity", "Art Direction", "Campaigns", "Packaging", "Motion", "Strategy"]} />

      {/* FEATURED — color-blocked sections */}
      {featured.map((p, i) => (
        <FeaturedSection key={p._id} project={p} index={i} />
      ))}

      {/* INDEX TABLE */}
      {rest.length > 0 && (
        <section className="mx-auto max-w-[1700px] px-5 py-14 md:px-10 md:py-20">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="display text-4xl md:text-6xl">
              Index<span className="text-accent">.</span>
            </h2>
            <span className="mono-label opacity-60">({String(rest.length).padStart(2, "0")}) more projects</span>
          </div>
          <div className="border-t-2 rule">
            {rest.map((p, i) => (
              <Link
                key={p._id}
                href={`/work/${p.slug}`}
                className="work-row flex items-baseline justify-between gap-4 py-4"
              >
                <span className="flex min-w-0 items-baseline gap-4 md:gap-6">
                  <span className="num shrink-0">{String(i + featured.length + 1).padStart(2, "0")}</span>
                  <span className="display truncate text-2xl md:text-5xl">{p.title}</span>
                </span>
                <span className="flex shrink-0 items-baseline gap-4">
                  {p.tags?.[0] && <span className="mono-label hidden opacity-60 md:inline">{p.tags[0]}</span>}
                  {p.year && <span className="mono-label opacity-60">({p.year.slice(-4)})</span>}
                  <span className="row-arrow display text-2xl md:text-4xl">→</span>
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-10">
            <Link href="/work" className="stamp-btn">
              View all work →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
