import Link from "next/link";
import Image from "next/image";
import { urlFor, type ProjectCard } from "@/lib/sanity";

/** A horizontally drifting row of project thumbnails — the work-page motion from the reference. */
export default function ThumbRow({
  projects,
  direction = "left",
  startIndex = 0,
}: {
  projects: ProjectCard[];
  direction?: "left" | "right";
  startIndex?: number;
}) {
  const placeholderTones = ["#ECDFAB", "#F9B122", "#1B7754", "#EB3D00"];
  const items = (prefix: string) =>
    projects.map((p, i) => (
      <Link key={`${prefix}-${p._id}`} href={`/work/${p.slug}`} className="group block w-[280px] shrink-0 md:w-[400px]">
        <div className="img-zoom relative aspect-[16/10] w-full overflow-hidden">
          {p.heroImage ? (
            <Image
              src={urlFor(p.heroImage).width(900).fit("max").url()}
              alt={p.title}
              fill
              sizes="400px"
              className="object-cover"
            />
          ) : (
            <div className="h-full w-full" style={{ background: placeholderTones[(startIndex + i) % 4] }} />
          )}
        </div>
        <div className="mt-2 flex items-baseline gap-3">
          <span className="num">{String(startIndex + i + 1).padStart(2, "0")}</span>
          <span className="display text-xl transition-colors group-hover:text-accent md:text-2xl">{p.title}</span>
        </div>
      </Link>
    ));

  return (
    <div className="overflow-hidden">
      <div className={`thumb-track ${direction === "left" ? "left" : "right"} py-4`}>
        {items("a")}
        {items("b")}
      </div>
    </div>
  );
}
