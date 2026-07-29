"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef, useState } from "react";

export type IndexRow = {
  id: string;
  title: string;
  slug: string;
  tag?: string;
  num: string;
  img?: string | null;
};

/** The quiet homepage project index, with a cursor-following image preview.
 *  All preview images are mounted (hidden) up front so they're already loaded
 *  by the time a row is hovered — no lag, no pop-in. */
export default function HoverIndex({ rows }: { rows: IndexRow[] }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState<number | null>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });

  const onMove = (e: React.MouseEvent) => {
    const r = wrapRef.current?.getBoundingClientRect();
    if (!r) return;
    setPos({ x: e.clientX - r.left, y: e.clientY - r.top });
  };

  const showing = active !== null && !!rows[active]?.img;

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
        >
          <span className="flex items-baseline gap-4">
            <span className="num">{p.num}</span>
            <span className="text-lg md:text-2xl">{p.title}</span>
          </span>
          <span className="label opacity-70">{p.tag}</span>
        </Link>
      ))}

      {/* cursor-following preview — all images stay mounted for instant swap */}
      <div
        className="pointer-events-none absolute z-30 hidden md:block"
        style={{ left: pos.x + 32, top: pos.y, transform: "translateY(-50%)" }}
      >
        <div
          className={`relative aspect-[4/3] w-[300px] overflow-hidden shadow-xl transition-all duration-200 ease-out ${
            showing ? "scale-100 opacity-100" : "scale-95 opacity-0"
          }`}
        >
          {rows.map(
            (p, i) =>
              p.img && (
                <Image
                  key={p.id}
                  src={p.img}
                  alt=""
                  fill
                  sizes="300px"
                  loading="eager"
                  className={`object-cover transition-opacity duration-150 ${
                    active === i ? "opacity-100" : "opacity-0"
                  }`}
                />
              )
          )}
        </div>
      </div>
    </div>
  );
}
