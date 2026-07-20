import Image from "next/image";
import { getAbout, getSettings, urlFor } from "@/lib/sanity";
import Reveal from "@/components/Reveal";
import WordReveal from "@/components/WordReveal";
import Doodle from "@/components/Doodle";

export const revalidate = 60;

export const metadata = { title: "About — Nicole Avritch" };

export default async function AboutPage() {
  const [about, settings] = await Promise.all([getAbout(), getSettings()]);
  const positioning = settings.tagline?.split(/\s*&\s*/) || [];

  return (
    <div id="top" className="mx-auto max-w-[1500px] px-5 pt-8 md:px-10">
      {/* Playful opener */}
      <section className="mx-auto max-w-3xl py-10 md:py-16">
        <p className="label mb-5 opacity-50">Get to know me</p>
        <div className="relative">
          {about?.headline && <WordReveal text={about.headline} className="text-3xl leading-snug md:text-5xl" />}
          <Doodle name="smiley" className="absolute -left-20 top-0 hidden h-14 w-14 text-accent md:block" strokeWidth={5} />
          <Doodle name="chevrons" className="mt-8 h-9 w-9 text-accent" delay={0.8} />
        </div>
      </section>

      {/* Positioning */}
      <section className="py-8">
        <h1 className="text-3xl leading-tight md:text-5xl">
          {positioning.map((p, i) => (
            <span key={i} className="block">
              {i > 0 && <span className="text-accent">| </span>}
              {p.trim()}
            </span>
          ))}
          <span className="block">
            <span className="text-accent">| </span>Curious-minded
          </span>
        </h1>
      </section>

      {/* Bio + skills columns */}
      <section className="grid gap-12 py-10 md:grid-cols-[2fr_1fr] md:gap-20">
        <div className="grid max-w-2xl gap-4 text-base leading-relaxed md:text-lg">
          {about?.bio?.split(/\n\s*\n/).map((p, i) => (
            <Reveal key={i} delay={i * 0.08}>
              <p>{p}</p>
            </Reveal>
          ))}
        </div>
        <div className="grid content-start gap-8">
          {about?.skills && about.skills.length > 0 && (
            <Reveal>
              <div>
                <p className="text-sm font-medium leading-relaxed">{about.skills.join(", ")}</p>
                <p className="label mt-1 opacity-40">Craft</p>
              </div>
            </Reveal>
          )}
          <Reveal delay={0.1}>
            <div>
              <p className="text-sm font-medium leading-relaxed">
                Adobe Creative Suite, Figma, Canva, Wordpress, basic CSS/HTML, and an expanding AI toolkit (Midjourney,
                Figma Weave, Claude, Gemini)
              </p>
              <p className="label mt-1 opacity-40">Software</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Experience / education grid */}
      <section className="grid gap-10 border-t rule py-12 md:grid-cols-3">
        <div>
          <p className="label mb-4 opacity-40">Experience</p>
          <div className="grid gap-4">
            {about?.experience?.map((e, i) => (
              <div key={i}>
                <p className="text-sm font-medium">
                  {e.role} | {e.company}
                </p>
                <p className="label mt-0.5 opacity-50">{e.dates}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="label mb-4 opacity-40">Recognition & education</p>
          <div className="grid gap-3">
            {about?.recognition?.map((r, i) => (
              <p key={i} className="text-sm leading-relaxed">
                {r}
              </p>
            ))}
          </div>
        </div>
        <div className="relative">
          <Doodle name="heart" className="absolute -top-2 right-0 h-8 w-8 text-accent" strokeWidth={6} />
          <p className="label mb-4 opacity-40">Currently</p>
          <p className="text-sm leading-relaxed">
            Senior Designer at Independent Pet Partners — and open to art-direction roles where strategy and craft
            meet.
          </p>
        </div>
      </section>

      {/* Portrait */}
      {about?.portrait && (
        <section className="py-10">
          <Reveal>
            <div className="img-zoom relative mx-auto aspect-[4/3] w-full max-w-3xl overflow-hidden">
              <Image
                src={urlFor(about.portrait).width(1400).fit("max").url()}
                alt={settings.siteTitle}
                fill
                sizes="(min-width: 768px) 60vw, 95vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </section>
      )}
    </div>
  );
}
