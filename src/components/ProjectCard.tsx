import Link from "next/link";
import Image from "next/image";
import { urlFor, type ProjectCard as Card } from "@/lib/sanity";

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
    <Link href={`/work/${project.slug}`} className="group block">
      <div
        className={`img-zoom relative w-full overflow-hidden border rule bg-surface ${
          large ? "aspect-[16/10]" : "aspect-[4/3]"
        }`}
      >
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
            <span className="display text-4xl opacity-20">{project.title}</span>
          </div>
        )}
        {typeof index === "number" && (
          <span className="mono-label absolute left-3 top-3 rounded-full border rule bg-bg px-3 py-1">
            {String(index + 1).padStart(2, "0")}
          </span>
        )}
      </div>
      <div className="mt-3 flex items-baseline justify-between gap-4">
        <h3 className={`display transition-colors group-hover:text-accent ${large ? "text-3xl md:text-5xl" : "text-2xl md:text-3xl"}`}>
          {project.title}
        </h3>
        {project.year && <span className="mono-label shrink-0 opacity-70">{project.year}</span>}
      </div>
      {project.tags && project.tags.length > 0 && (
        <p className="mono-label mt-1 opacity-60">{project.tags.slice(0, 4).join(" · ")}</p>
      )}
    </Link>
  );
}
