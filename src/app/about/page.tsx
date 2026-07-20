import Image from "next/image";
import { getAbout, getSettings, urlFor } from "@/lib/sanity";
import Reveal from "@/components/Reveal";

export const revalidate = 60;

export const metadata = { title: "About — Nicole Avritch" };

export default async function AboutPage() {
  const [about, settings] = await Promise.all([getAbout(), getSettings()]);

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 md:px-10 md:py-16">
      <h1 className="display text-[16vw] md:text-[9vw]">
        About<span className="text-accent">.</span>
      </h1>

      <div className="mt-12 grid gap-12 md:grid-cols-[1.1fr_1fr] md:gap-20">
        <div>
          {about?.headline && (
            <Reveal>
              <p className="display text-3xl md:text-5xl" style={{ lineHeight: 1.08 }}>
                {about.headline}
              </p>
            </Reveal>
          )}
          {about?.bio && (
            <Reveal delay={0.1}>
              <div className="mt-8 grid max-w-2xl gap-4 text-lg leading-relaxed">
                {about.bio.split(/\n\s*\n/).map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
            </Reveal>
          )}
          {settings.email && (
            <Reveal delay={0.15}>
              <a
                href={`mailto:${settings.email}`}
                className="mono-label mt-10 inline-block border rule rounded-full px-5 py-3 transition-colors hover:bg-accent hover:text-bg hover:border-transparent"
              >
                {settings.email} →
              </a>
            </Reveal>
          )}
        </div>
        <div>
          {about?.portrait && (
            <Reveal>
              <div className="img-zoom relative aspect-[4/5] w-full overflow-hidden border rule bg-surface">
                <Image
                  src={urlFor(about.portrait).width(1200).fit("max").url()}
                  alt="Portrait"
                  fill
                  sizes="(min-width: 768px) 45vw, 95vw"
                  className="object-cover"
                />
              </div>
            </Reveal>
          )}
        </div>
      </div>

      {about?.experience && about.experience.length > 0 && (
        <section className="mt-20">
          <h2 className="mono-label mb-4 opacity-60">Experience</h2>
          <div className="border-t rule">
            {about.experience.map((e, i) => (
              <Reveal key={i}>
                <div className="grid gap-1 border-b rule py-5 md:grid-cols-[2fr_2fr_1fr] md:items-baseline">
                  <p className="display text-2xl md:text-3xl">{e.company}</p>
                  <div>
                    <p className="text-base">{e.role}</p>
                    {e.summary && <p className="mt-1 text-sm opacity-70">{e.summary}</p>}
                  </div>
                  <p className="mono-label opacity-60 md:text-right">{e.dates}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      <div className="mt-20 grid gap-12 md:grid-cols-2">
        {about?.skills && about.skills.length > 0 && (
          <section>
            <h2 className="mono-label mb-4 opacity-60">Capabilities</h2>
            <div className="flex flex-wrap gap-2">
              {about.skills.map((s, i) => (
                <span key={i} className="mono-label border rule rounded-full px-4 py-2">
                  {s}
                </span>
              ))}
            </div>
          </section>
        )}
        {about?.recognition && about.recognition.length > 0 && (
          <section>
            <h2 className="mono-label mb-4 opacity-60">Recognition</h2>
            <ul className="grid gap-2">
              {about.recognition.map((r, i) => (
                <li key={i} className="flex items-baseline gap-3 text-lg">
                  <span className="text-accent">✦</span> {r}
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </div>
  );
}
