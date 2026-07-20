import Link from "next/link";
import Image from "next/image";
import { urlFor, type ProjectCard as Card } from "@/lib/sanity";
import Star from "@/components/Star";

export default function ProjectCard({
  project,
  large = false,
  index,
}: {
  project: Card;
  large?: boolean;
  index?: number;
}) {
  return (
    <Link href={`/work/${project.slug}`} className="group frame block bg-bg transition-transform duration-300 hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--ink)]">
      <div className="flex items-center justify-between border-b-2 rule px-4 py-2.5">
        {typeof index === "number" && <span className="num">{String(index + 1).padStart(2, "0")}</span>}
        <span className="mono-label opacity-60">{project.year || project.tags?.[0] || "—"}</span>
      </div>
      <div className={`img-zoom relative w-full overflow-hidden border-b-2 rule bg-surface ${large ? "aspect-[16/10]" : "aspect-[4/3]"}`}>
        {project.heroImage ? (
          <Image
            src={urlFor(project.heroImage).width(large ? 1600 : 900).fit("max").url()}
            alt={project.title}
            fill
            sizes={large ? "(min-width: 768px) 90vw, 100vw" : "(min-width: 768px) 45vw, 100vw"}
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Star className="h-16 w-16 opacity-25" spin={false} />
          </div>
        )}
      </div>
      <div className="px-4 py-3">
        <h3 className={`display transition-colors group-hover:text-accent ${large ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl"}`}>
          {project.title}
        </h3>
        {project.tags && project.tags.length > 0 && (
          <p className="mono-label mt-1.5 opacity-60">{project.tags.slice(0, 4).join(" · ")}</p>
        )}
      </div>
    </Link>
  );
}
