import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getProjects, getSettings } from "@/lib/sanity";
import SmartImage from "@/components/SmartImage";
import BlockRenderer from "@/components/BlockRenderer";
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

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [project, all, settings] = await Promise.all([getProject(slug), getProjects(), getSettings()]);
  const L = settings.labels || {};
  if (!project) notFound();

  const idx = all.findIndex((p) => p.slug === slug);
  const next = all.length > 1 ? all[(idx + 1) % all.length] : null;

  const meta = [project.client, project.role, project.year].filter(Boolean).join("  ·  ");

  return (
    <article id="top">
      <header className="mx-auto max-w-[1500px] px-5 pt-8 md:px-10">
        <p className="label mb-6 opacity-70">
          <Link href="/work" className="transition-colors hover:text-accent">
            {L.backToWork || "← Work"}
          </Link>
          {"  "}/ {String(idx + 1).padStart(2, "0")}
        </p>
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
      </header>

      {project.heroImage && !project.hideHero && (
        <div className="mx-auto max-w-[1500px] px-5 md:px-10">
          <Reveal>
            <div className="img-zoom overflow-hidden">
              <SmartImage image={project.heroImage} alt={project.title} sizes="95vw" maxWidth={2200} priority />
            </div>
          </Reveal>
        </div>
      )}

      {project.blocks && project.blocks.length > 0 && (
        <div className="mx-auto max-w-[1500px] px-5 py-12 md:px-10 md:py-16">
          <BlockRenderer blocks={project.blocks} />
        </div>
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
