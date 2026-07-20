"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { urlFor, type ProjectCard } from "@/lib/sanity";

/** A row of large project thumbnails that slides horizontally as you scroll,
 *  like the reference work page. Direction alternates per row. */
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
  const x = useTransform(scrollYProgress, [0, 1], [`${dir * -6}%`, `${dir * 6}%`]);

  const tones = ["#ECDFAB", "#F9B122", "#1B7754", "#EB3D00"];

  return (
    <div ref={ref} className="overflow-hidden py-2">
      <motion.div style={{ x }} className="flex w-max gap-5 md:gap-8">
        {projects.map((p, i) => (
          <Link key={p._id} href={`/work/${p.slug}`} className="group block w-[80vw] shrink-0 md:w-[44vw]">
            <div className="img-zoom relative aspect-[16/10] w-full overflow-hidden">
              {p.heroImage ? (
                <Image
                  src={urlFor(p.heroImage).width(1400).fit("max").url()}
                  alt={p.title}
                  fill
                  sizes="(min-width: 768px) 44vw, 80vw"
                  className="object-cover"
                />
              ) : (
                <div className="h-full w-full" style={{ background: tones[(startIndex + i) % 4] }} />
              )}
            </div>
            <div className="mt-2 flex items-baseline justify-between">
              <span className="text-xl font-medium transition-colors group-hover:text-accent md:text-3xl">
                {p.title}
              </span>
              <span className="num">{p.year ? `${p.year}`.slice(-4) : String(startIndex + i + 1).padStart(2, "0")}</span>
            </div>
          </Link>
        ))}
      </motion.div>
    </div>
  );
}
