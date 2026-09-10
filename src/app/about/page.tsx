import { getAbout, getSettings } from "@/lib/sanity";
import Reveal from "@/components/Reveal";
import SmartImage from "@/components/SmartImage";

export const revalidate = 60;

export const metadata = { title: "About — Nicole Avritch" };

export default async function AboutPage() {
  const [about, settings] = await Promise.all([getAbout(), getSettings()]);
  const L = settings.labels || {};

  return (
    <div id="top" className="mx-auto max-w-[1500px] px-5 pt-8 md:px-10">
      {/* Photo + About + Contact, after her own portfolio's layout */}
      <section className="grid gap-10 py-8 md:grid-cols-[1fr_1.3fr] md:gap-20 md:py-12">
        <div>
          {about?.portrait && (
            <Reveal>
              <SmartImage image={about.portrait} alt={settings.siteTitle} sizes="(min-width: 768px) 40vw, 95vw" maxWidth={2000} />
            </Reveal>
          )}
        </div>
        <div className="grid content-start gap-10">
          <div>
            <h2 className="display mb-4 text-3xl md:text-4xl">{L.aboutHeading || "About"}</h2>
            <div className="grid max-w-xl gap-4 text-base leading-relaxed md:text-lg">
              {about?.bio?.split(/\n\s*\n/).map((p, i) => (
                <Reveal key={i} delay={i * 0.07}>
                  <p>{p}</p>
                </Reveal>
              ))}
            </div>
          </div>
          <div>
            <h2 className="display mb-4 text-3xl md:text-4xl">{L.contactHeading || "Contact"}</h2>
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="text-link block text-lg">
                {settings.email.replace("@", " [at] ")}
              </a>
            )}
            {settings.phone && <p className="mt-1 text-lg">{settings.phone}</p>}
          </div>
        </div>
      </section>

      {/* Experience / recognition / skills */}
      <section className="grid gap-10 border-t rule py-12 md:grid-cols-[0.85fr_1.25fr_1fr] md:gap-14">
        <div>
          <p className="label mb-4 opacity-60">{L.experienceLabel || "Experience"}</p>
          <div className="grid gap-5">
            {about?.experience?.map((e, i) => (
              <div key={i}>
                <p className="text-base font-medium">
                  {e.role} | {e.company}
                </p>
                <p className="label mt-1 opacity-70">{e.dates}</p>
              </div>
            ))}
          </div>
        </div>
        <div>
          <p className="label mb-4 opacity-60">{L.recognitionLabel || "Recognition & education"}</p>
          <div className="grid gap-4">
            {about?.recognition?.map((r, i) => (
              <p key={i} className="text-base leading-relaxed">
                {r}
              </p>
            ))}
          </div>
        </div>
        <div className="grid content-start gap-8">
          {about?.skills && about.skills.length > 0 && (
            <div>
              <p className="label mb-4 opacity-60">{L.craftLabel || "Craft"}</p>
              <p className="text-base font-medium leading-relaxed">{about.skills.join(", ")}</p>
            </div>
          )}
          <div>
            <p className="label mb-4 opacity-60">{L.softwareLabel || "Software"}</p>
            <p className="text-base font-medium leading-relaxed">
              {about?.software ||
                "Adobe Creative Suite, Figma, Canva, Wordpress, basic CSS/HTML, and an expanding AI toolkit (Midjourney, Figma Weave, Claude, Gemini)"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
