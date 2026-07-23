"use client";

import { useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import { urlFor, type ProjectCard } from "@/lib/sanity";

const tones = ["var(--accent)", "var(--ink)"];

function Tile({ p, idx, mobile = false }: { p: ProjectCard; idx: number; mobile?: boolean }) {
  return (
    <Link
      href={`/work/${p.slug}`}
      className={`group block shrink-0 ${mobile ? "w-full" : "w-[calc(50vw-2.5rem)]"}`}
    >
      <div className="img-zoom relative aspect-[16/10] w-full overflow-hidden">
        {p.heroImage ? (
          <Image
            src={urlFor(p.heroImage).width(1400).fit("max").url()}
            alt={p.title}
            fill
            sizes={mobile ? "95vw" : "48vw"}
            className="object-cover"
          />
        ) : (
          <div className="h-full w-full" style={{ background: tones[idx % 2] }} />
        )}
      </div>
      <div className="mt-2 flex items-baseline justify-between gap-4">
        <span className="truncate text-xl font-medium transition-colors group-hover:text-accent md:text-3xl">
          {p.title}
        </span>
        <span className="num shrink-0">{p.tags?.[0] || p.year || ""}</span>
      </div>
    </Link>
  );
}

/** Desktop: rows drift horizontally on scroll (zero drift when centered).
 *  Mobile: a clean stacked list — no horizontal motion, nothing cut off. */
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

  return (
    <div ref={ref}>
      {/* mobile: stacked */}
      <div className="grid gap-8 px-5 md:hidden">
        {projects.map((p, i) => (
          <Tile key={p._id} p={p} idx={startIndex + i} mobile />
        ))}
      </div>
      {/* desktop: drifting row */}
      <div className="hidden overflow-hidden py-2 md:block">
        <motion.div style={{ x }} className="flex gap-8 px-10">
          {projects.map((p, i) => (
            <Tile key={p._id} p={p} idx={startIndex + i} />
          ))}
        </motion.div>
      </div>
    </div>
  );
}
