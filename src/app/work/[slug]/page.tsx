import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getProjects, getSettings, type ProjectSection } from "@/lib/sanity";
import SmartImage from "@/components/SmartImage";
import BlockRenderer, { Blocks, collectGalleryImages } from "@/components/BlockRenderer";
import GalleryProvider from "@/components/Gallery";
import SectionToc from "@/components/SectionToc";
import Reveal from "@/components/Reveal";
import WordReveal from "@/components/WordReveal";

export const revalidate = 60;

export async function generateStaticParams() {
  const projects = await getProjects();
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);
  return { title: project ? `${project.title} — Nicole Avritch` : "Project" };
}

const anchorId = (title: string, i: number) =>
  `sec-${(title || String(i)).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || i}`;

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, all, settings] = await Promise.all([getProject(slug), getProjects(), getSettings()]);
  const L = settings.labels || {};
  if (!project) notFound();

  const idx = all.findIndex((p) => p.slug === slug);
  const next = all.length > 1 ? all[(idx + 1) % all.length] : null;

  const meta = [project.client, project.role, project.year].filter(Boolean).join("  ·  ");

  // sections with actual VISIBLE content drive the chaptered layout + table of
  // contents (statsRow renders nothing on the live site, so it doesn't count)
  const sections: ProjectSection[] = (project.sections || []).filter(
    (s) => (s.blocks || []).some((b) => b._type !== "statsRow") || s.intro
  );
  const chaptered = sections.length > 0;
  const tocItems = sections.map((s, i) => ({ id: anchorId(s.title || "", i), title: s.title || `Section ${i + 1}` }));
  const gallery = chaptered ? collectGalleryImages(sections.map((s) => s.blocks || [])) : null;

  return (
    <article id="top">
      <header className="mx-auto max-w-[1500px] px-5 pt-8 md:px-10">
        <p className="label mb-6 opacity-70">
          <Link href="/work" className="transition-colors hover:text-accent">
            {L.backToWork || "← Work"}
          </Link>
          {"  "}/ {String(idx + 1).padStart(2, "0")}
        </p>

        {chaptered ? (
          <>
            {/* chaptered opening: name + intro + index all above the fold,
                first chapter already peeking underneath */}
            <h1 className="display text-[11vw] leading-[0.9] md:text-[7vw]">{project.title}</h1>
            <div className="mt-3 flex flex-wrap gap-x-6 gap-y-1 md:mt-4">
              {meta && <p className="label opacity-60">{meta}</p>}
              {project.tags && project.tags.length > 0 && (
                <p className="label opacity-60">{project.tags.join("  /  ")}</p>
              )}
            </div>
          </>
        ) : (
          <>
            <h1 className="display text-[13vw] md:text-[9vw]">{project.title}</h1>
            {meta && <p className="label mt-5 opacity-60">{meta}</p>}
            {project.tags && project.tags.length > 0 && (
              <p className="label mt-1.5 opacity-60">{project.tags.join("  /  ")}</p>
            )}
            {project.intro && (
              <div className="max-w-3xl py-10 md:py-14">
                <WordReveal text={project.intro} className="text-2xl leading-snug md:text-3xl" />
              </div>
            )}
          </>
        )}
      </header>

      {!chaptered && project.heroImage && !project.hideHero && (
        <div className="mx-auto max-w-[1500px] px-5 md:px-10">
          <Reveal>
            <div className="img-zoom overflow-hidden">
              <SmartImage image={project.heroImage} alt={project.title} sizes="95vw" maxWidth={3200} priority />
            </div>
          </Reveal>
        </div>
      )}

      {chaptered && gallery ? (
        <GalleryProvider images={gallery.images}>
          <div className="mx-auto max-w-[1500px] px-5 pt-8 pb-10 md:px-10 md:pt-10 md:pb-14">
            <div className="grid gap-8 lg:grid-cols-[280px_minmax(0,1fr)] lg:gap-16 xl:gap-20">
              {/* left rail: project blurb + section index — frees the fold for imagery */}
              <div className="min-w-0">
                {project.intro && (
                  <p className="mb-8 max-w-[34ch] text-[0.95rem] leading-relaxed opacity-90 md:mb-10">
                    {project.intro}
                  </p>
                )}
                <SectionToc items={tocItems} label={L.tocLabel || "What I made"} />
              </div>
              <div className="min-w-0 grid gap-16 md:gap-24">
                {sections.map((s, i) => (
                  <section key={s._key} id={tocItems[i].id} className={`scroll-mt-28 border-t rule pt-8 md:pt-10 ${i === 0 ? "md:border-t-0 md:pt-0" : ""}`}>
                    <Reveal>
                      <div className="mb-8 flex items-baseline gap-4 md:mb-10">
                        <span className="num">{String(i + 1).padStart(2, "0")}</span>
                        <h2 className="display text-4xl md:text-6xl">{s.title}</h2>
                      </div>
                    </Reveal>
                    {s.intro && (
                      <div className="mb-8 max-w-2xl md:mb-10">
                        <p className="text-lg leading-relaxed">{s.intro}</p>
                      </div>
                    )}
                    {s.blocks && s.blocks.length > 0 && (
                      <div className="mx-auto w-full max-w-[1000px]">
                        <Blocks blocks={s.blocks} indexOf={gallery.indexOf} />
                      </div>
                    )}
                  </section>
                ))}
              </div>
            </div>
          </div>
        </GalleryProvider>
      ) : (
        project.blocks &&
        project.blocks.length > 0 && (
          <div className="mx-auto max-w-[1500px] px-5 py-12 md:px-10 md:py-16">
            <BlockRenderer blocks={project.blocks} />
          </div>
        )
      )}

      {project.credits && (
        <div className="mx-auto max-w-[1500px] px-5 pb-12 md:px-10">
          <p className="label max-w-2xl whitespace-pre-line leading-relaxed opacity-70">{project.credits}</p>
        </div>
      )}

      {next && (
        <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-24">
          <p className="label mb-4 opacity-70">{L.nextProject || "Next project"}</p>
          <Link href={`/work/${next.slug}`} className="group flex items-baseline justify-between">
            <span className="display text-4xl transition-colors group-hover:text-accent md:text-7xl">
              {next.title}
            </span>
            <span className="display text-4xl transition-transform group-hover:translate-x-3 md:text-7xl">→</span>
          </Link>
        </div>
      )}
    </article>
  );
}
