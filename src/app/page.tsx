import Link from "next/link";
import { getProjects, getSettings } from "@/lib/sanity";
import ProjectCard from "@/components/ProjectCard";
import Marquee from "@/components/Marquee";
import Reveal from "@/components/Reveal";

export const revalidate = 60;

export default async function Home() {
  const [settings, projects] = await Promise.all([getSettings(), getProjects()]);
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  const nameParts = settings.siteTitle.split(" ");

  const marqueeItems =
    featured.length > 0
      ? ["Brand Identity", "Art Direction", "Campaigns", "Packaging", "Motion", "Strategy"]
      : ["Portfolio in progress", "Brand Identity", "Art Direction", "Campaigns"];

  return (
    <div>
      {/* HERO */}
      <section className="mx-auto max-w-[1600px] px-5 pb-10 pt-10 md:px-10 md:pt-16">
        <p className="mono-label mb-4 flex items-center gap-3">
          <span className="inline-block h-2 w-2 rounded-full bg-accent" />
          {settings.tagline}
        </p>
        <h1 className="display text-[19.5vw] md:text-[13.5vw]">
          {nameParts.map((part) => (
            <span key={part} className="block">
              {part}
            </span>
          ))}
        </h1>
        <div className="mt-8 grid gap-6 border-t rule pt-6 md:grid-cols-2">
          <p className="mono-label opacity-70">
            Est. 2017 — working across the full creative arc,
            <br />
            from strategic brief to final asset.
          </p>
          {settings.heroLine && <p className="max-w-lg text-lg leading-relaxed">{settings.heroLine}</p>}
        </div>
      </section>

      <Marquee items={marqueeItems} />

      {/* FEATURED */}
      {featured.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
          <div className="mb-10 flex items-end justify-between">
            <h2 className="display text-4xl md:text-6xl">
              Selected<span className="text-accent">*</span> work
            </h2>
            <p className="mono-label hidden opacity-60 md:block">*the ones worth talking about</p>
          </div>
          <div className="grid gap-14">
            {featured.map((p, i) => (
              <Reveal key={p._id}>
                <ProjectCard project={p} large index={i} />
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* INDEX OF EVERYTHING ELSE */}
      {rest.length > 0 && (
        <section className="mx-auto max-w-[1600px] px-5 pb-20 md:px-10">
          <h2 className="mono-label mb-4 opacity-60">Full index</h2>
          <div className="border-t rule">
            {rest.map((p, i) => (
              <Link
                key={p._id}
                href={`/work/${p.slug}`}
                className="work-row flex items-baseline justify-between gap-4 border-b rule py-4"
              >
                <span className="flex items-baseline gap-4 overflow-hidden">
                  <span className="mono-label w-8 shrink-0 opacity-50">
                    {String(i + featured.length + 1).padStart(2, "0")}
                  </span>
                  <span className="display truncate text-2xl md:text-4xl">{p.title}</span>
                </span>
                <span className="flex shrink-0 items-baseline gap-4">
                  {p.tags?.[0] && <span className="mono-label hidden opacity-60 md:inline">{p.tags[0]}</span>}
                  <span className="row-arrow display text-2xl md:text-4xl">→</span>
                </span>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/work" className="mono-label inline-block border rule rounded-full px-5 py-3 transition-colors hover:bg-accent hover:text-bg hover:border-transparent">
              All work →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
