"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

export type IndexRow = {
  id: string;
  title: string;
  slug: string;
  tag?: string;
  num: string;
  img?: string | null;
};

/** The quiet homepage project index, with a cursor-following image preview
 *  so hovering a row shows the project's imagery (desktop only). */
export default function HoverIndex({ rows }: { rows: IndexRow[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  return (
    <div
      ref={wrapRef}
      className="relative border-t rule"
      onMouseMove={onMove}
      onMouseLeave={() => setActive(null)}
    >
      {rows.map((p, i) => (
        <Link
          key={p.id}
          href={`/work/${p.slug}`}
          className="work-row flex items-baseline justify-between py-3.5"
          style={{ "--row-c": "var(--ink)", "--row-t": "var(--background)" } as React.CSSProperties}
          onMouseEnter={() => setActive(i)}
          onFocus={() => setActive(null)}
        >
          <span className="flex items-baseline gap-4">
            <span className="num">{p.num}</span>
            <span className="text-lg md:text-2xl">{p.title}</span>
          </span>
          <span className="label opacity-70">{p.tag}</span>
        </Link>
      ))}

      {/* cursor-following preview */}
      <div
        className="pointer-events-none absolute z-30 hidden md:block"
        style={{ left: pos.x + 32, top: pos.y, transform: "translateY(-50%)" }}
      >
        <AnimatePresence mode="wait">
          {active !== null && rows[active]?.img && (
            <motion.div
              key={rows[active].id}
              initial={{ opacity: 0, scale: 0.94 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="w-[300px] overflow-hidden shadow-xl"
            >
              <Image
                src={rows[active].img as string}
                alt=""
                width={600}
                height={450}
                className="aspect-[4/3] w-full object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
