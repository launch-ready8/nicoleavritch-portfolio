import Image from "next/image";
import { getAbout, getSettings, urlFor } from "@/lib/sanity";
import Reveal from "@/components/Reveal";
import Star from "@/components/Star";

export const revalidate = 60;

export const metadata = { title: "About — Nicole Avritch" };

export default async function AboutPage() {
  const [about, settings] = await Promise.all([getAbout(), getSettings()]);

  return (
    <div>
      <div className="border-b-2 rule">
        <div className="relative mx-auto max-w-[1700px] px-5 py-10 md:px-10 md:py-14">
          <h1 className="display text-[16vw] md:text-[9vw]">
            About<span className="text-accent">.</span>
          </h1>
          <Star className="absolute right-[8%] top-[22%] h-[8vw] w-[8vw] text-accent" />
        </div>
      </div>

      <div className="mx-auto max-w-[1700px] px-5 py-12 md:px-10">
        <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:gap-16">
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
                <div className="mt-8 grid max-w-2xl gap-4 border-t-2 rule pt-6 text-lg leading-relaxed">
                  {about.bio.split(/\n\s*\n/).map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                </div>
              </Reveal>
            )}
            {settings.email && (
              <Reveal delay={0.15}>
                <a href={`mailto:${settings.email}`} className="stamp-btn mt-10">
                  {settings.email} →
                </a>
              </Reveal>
            )}
          </div>
          <div>
            {about?.portrait && (
              <Reveal>
                <figure className="frame bg-bg">
                  <div className="img-zoom relative aspect-[4/5] w-full overflow-hidden bg-surface">
                    <Image
                      src={urlFor(about.portrait).width(1200).fit("max").url()}
                      alt="Portrait"
                      fill
                      sizes="(min-width: 768px) 45vw, 95vw"
                      className="object-cover"
                    />
                  </div>
                  <figcaption className="mono-label border-t-2 rule px-4 py-2.5 opacity-70">
                    {settings.siteTitle} — {settings.tagline}
                  </figcaption>
                </figure>
              </Reveal>
            )}
          </div>
        </div>

        {about?.experience && about.experience.length > 0 && (
          <section className="mt-20">
            <h2 className="display mb-6 text-4xl md:text-6xl">
              Experience<span className="text-accent">.</span>
            </h2>
            <div className="border-t-2 rule">
              {about.experience.map((e, i) => (
                <Reveal key={i}>
                  <div className="grid gap-1 border-b-2 rule py-5 md:grid-cols-[auto_2fr_2fr_1fr] md:items-baseline md:gap-6">
                    <span className="num self-start">{String(i + 1).padStart(2, "0")}</span>
                    <p className="display text-2xl md:text-3xl">{e.company}</p>
                    <div>
                      <p className="text-base font-medium">{e.role}</p>
                      {e.summary && <p className="mt-1 text-sm opacity-70">{e.summary}</p>}
                    </div>
                    <p className="mono-label opacity-60 md:text-right">{e.dates}</p>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>
        )}

        <div className="mt-16 grid gap-0 md:grid-cols-2">
          {about?.skills && about.skills.length > 0 && (
            <section className="frame p-6 md:p-8">
              <h2 className="mono-label mb-5 flex items-center gap-2 opacity-70">
                <span className="text-accent">✦</span> Capabilities
              </h2>
              <div className="flex flex-wrap gap-2">
                {about.skills.map((s, i) => (
                  <span key={i} className="mono-label border-2 rule px-3.5 py-2">
                    {s}
                  </span>
                ))}
              </div>
            </section>
          )}
          {about?.recognition && about.recognition.length > 0 && (
            <section className="frame border-t-0 p-6 md:border-l-0 md:border-t-2 md:p-8">
              <h2 className="mono-label mb-5 flex items-center gap-2 opacity-70">
                <span className="text-accent">✦</span> Recognition
              </h2>
              <ul className="grid gap-3">
                {about.recognition.map((r, i) => (
                  <li key={i} className="flex items-baseline gap-3 text-lg">
                    <span className="num shrink-0">{String(i + 1).padStart(2, "0")}</span> {r}
                  </li>
                ))}
              </ul>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
