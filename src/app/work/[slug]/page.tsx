import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getProject, getProjects, urlFor } from "@/lib/sanity";
import BlockRenderer from "@/components/BlockRenderer";
import Reveal from "@/components/Reveal";
import Star from "@/components/Star";

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
  ].filter((m) => m.value);

  return (
    <article>
      {/* Title */}
      <header className="border-b-2 rule">
        <div className="relative mx-auto max-w-[1700px] px-5 pt-8 md:px-10 md:pt-12">
          <p className="mono-label mb-5 flex items-center gap-3">
            <Link href="/work" className="transition-colors hover:text-accent">
              ← Work
            </Link>
            <span className="num">{String(idx + 1).padStart(2, "0")}</span>
          </p>
          <h1 className="display relative z-10 break-words pb-6 text-[14vw] md:text-[9vw]">{project.title}</h1>
          <Star className="absolute right-[5%] top-[38%] h-[9vw] w-[9vw] text-accent md:right-[8%]" />
        </div>
        {/* spec table */}
        <div className="border-t-2 rule">
          <div className="mx-auto grid max-w-[1700px] grid-cols-2 md:grid-cols-4">
            {meta.map((m, i) => (
              <div
                key={m.label}
                className={`border-b-2 rule px-5 py-4 md:border-b-0 md:px-10 ${i > 0 ? "md:border-l-2" : ""} ${i % 2 === 1 ? "border-l-2 md:border-l-2" : ""}`}
              >
                <p className="mono-label opacity-50">{m.label}</p>
                <p className="mt-1.5 text-sm font-medium md:text-base">{m.value}</p>
              </div>
            ))}
          </div>
        </div>
      </header>

      {project.intro && (
        <div className="border-b-2 rule bg-surface">
          <p className="mx-auto max-w-[1700px] px-5 py-10 text-xl leading-relaxed md:px-10 md:py-14 md:text-2xl [&>*]:max-w-4xl">
            {project.intro}
          </p>
        </div>
      )}

      {/* Hero image */}
      {project.heroImage && (
        <div className="mx-auto max-w-[1700px] px-5 pt-10 md:px-10 md:pt-14">
          <Reveal>
            <div className="img-zoom frame relative aspect-[16/9] w-full overflow-hidden bg-surface">
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
        <div className="mx-auto max-w-[1700px] px-5 py-12 md:px-10 md:py-16">
          <BlockRenderer blocks={project.blocks} />
        </div>
      )}

      {project.credits && (
        <div className="mx-auto max-w-[1700px] px-5 pb-12 md:px-10">
          <p className="mono-label max-w-2xl whitespace-pre-line leading-relaxed opacity-60">{project.credits}</p>
        </div>
      )}

      {/* Next project */}
      {next && (
        <Link href={`/work/${next.slug}`} className="group block border-t-2 rule bg-accent text-ink transition-colors hover:bg-ink hover:text-bg">
          <div className="mx-auto flex max-w-[1700px] items-baseline justify-between px-5 py-10 md:px-10 md:py-14">
            <div>
              <p className="mono-label mb-3">Next project ↴</p>
              <p className="display text-4xl md:text-7xl">{next.title}</p>
            </div>
            <span className="display text-4xl transition-transform group-hover:translate-x-3 md:text-7xl">→</span>
          </div>
        </Link>
      )}
    </article>
  );
}
