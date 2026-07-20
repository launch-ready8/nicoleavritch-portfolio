"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { urlFor, type ProjectCard } from "@/lib/sanity";

/** A row of large project thumbnails that drifts horizontally as you scroll.
 *  The drift is zero when the row is centered in the viewport, so nothing is
 *  cut off while you're actually looking at it. */
export default function ScrollRow({
  projects,
  direction = "left",
  startIndex = 0,
}: {
  projects: ProjectCard[];
  direction?: "left" | "right";
  startIndex?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const dir = direction === "left" ? -1 : 1;
  const x = useTransform(scrollYProgress, [0, 0.5, 1], [`${dir * -3.5}vw`, "0vw", `${dir * 3.5}vw`]);

  const tones = ["#ECDFAB", "#F9B122", "#1B7754", "#EB3D00"];

  return (
    <div ref={ref} className="overflow-hidden py-2">
      <motion.div style={{ x }} className="flex gap-5 px-5 md:gap-8 md:px-10">
        {projects.map((p, i) => (
          <Link
            key={p._id}
            href={`/work/${p.slug}`}
            className="group block w-[86vw] shrink-0 md:w-[calc(50vw-2.5rem)]"
          >
            <div className="img-zoom relative aspect-[16/10] w-full overflow-hidden">
              {p.heroImage ? (
                <Image
                  src={urlFor(p.heroImage).width(1400).fit("max").url()}
                  alt={p.title}
                  fill
                  sizes="(min-width: 768px) 48vw, 86vw"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full" style={{ background: tones[(startIndex + i) % 4] }} />
              )}
            </div>
            <div className="mt-2 flex items-baseline justify-between gap-4">
              <span className="truncate text-xl font-medium transition-colors group-hover:text-accent md:text-3xl">
                {p.title}
              </span>
              <span className="num shrink-0">{p.year || String(startIndex + i + 1).padStart(2, "0")}</span>
            </div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
