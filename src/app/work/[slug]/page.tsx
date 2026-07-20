import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getProjects, urlFor } from "@/lib/sanity";
import BlockRenderer from "@/components/BlockRenderer";
import Reveal from "@/components/Reveal";

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
  const [project, all] = await Promise.all([getProject(slug), getProjects()]);
  if (!project) notFound();

  const idx = all.findIndex((p) => p.slug === slug);
  const next = all.length > 1 ? all[(idx + 1) % all.length] : null;

  const meta: { label: string; value?: string }[] = [
    { label: "Client", value: project.client },
    { label: "Role", value: project.role },
    { label: "Year", value: project.year },
    { label: "Scope", value: project.tags?.join(", ") },
  ];

  return (
    <article>
      {/* Title */}
      <header className="mx-auto max-w-[1600px] px-5 pt-10 md:px-10 md:pt-16">
        <p className="mono-label mb-4 opacity-60">
          <Link href="/work" className="hover:text-accent transition-colors">
            Work
          </Link>{" "}
          / {String(idx + 1).padStart(2, "0")}
        </p>
        <h1 className="display text-[13vw] md:text-[8.5vw]">{project.title}</h1>
        <div className="mt-8 grid grid-cols-2 gap-y-4 border-y rule py-5 md:grid-cols-4">
          {meta
            .filter((m) => m.value)
            .map((m) => (
              <div key={m.label}>
                <p className="mono-label opacity-50">{m.label}</p>
                <p className="mt-1 text-sm md:text-base">{m.value}</p>
              </div>
            ))}
        </div>
        {project.intro && (
          <p className="mt-8 max-w-3xl text-xl leading-relaxed md:text-2xl">{project.intro}</p>
        )}
      </header>

      {/* Hero image */}
      {project.heroImage && (
        <div className="mx-auto max-w-[1600px] px-5 pt-10 md:px-10">
          <Reveal>
            <div className="img-zoom relative aspect-[16/9] w-full overflow-hidden border rule bg-surface">
              <Image
                src={urlFor(project.heroImage).width(2200).fit("max").url()}
                alt={project.title}
                fill
                priority
                sizes="95vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        </div>
      )}

      {/* Blocks */}
      {project.blocks && project.blocks.length > 0 && (
        <div className="mx-auto max-w-[1600px] px-5 py-14 md:px-10 md:py-20">
          <BlockRenderer blocks={project.blocks} />
        </div>
      )}

      {project.credits && (
        <div className="mx-auto max-w-[1600px] px-5 pb-14 md:px-10">
          <p className="mono-label max-w-2xl whitespace-pre-line leading-relaxed opacity-60">
            {project.credits}
          </p>
        </div>
      )}

      {/* Next project */}
      {next && (
        <Link href={`/work/${next.slug}`} className="group block border-t rule">
          <div className="mx-auto flex max-w-[1600px] items-baseline justify-between px-5 py-10 md:px-10 md:py-14">
            <div>
              <p className="mono-label mb-3 opacity-60">Next project</p>
              <p className="display text-4xl transition-colors group-hover:text-accent md:text-7xl">
                {next.title}
              </p>
            </div>
            <span className="display text-4xl transition-transform group-hover:translate-x-2 md:text-7xl">
              →
            </span>
          </div>
        </Link>
      )}
    </article>
  );
}
