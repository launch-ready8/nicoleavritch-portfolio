"use client";

import { useEffect, useRef, useState } from "react";
import type { SanityImageSource } from "@/lib/sanity";
import ZoomImage from "@/components/ZoomImage";

/** Horizontal image slider: swipe / scroll-snap with typographic arrows and a
 *  counter. Slides open in the page lightbox like every other image. */
export default function Carousel({
  images,
  indexes,
  caption,
}: {
  images: SanityImageSource[];
  indexes: number[];
  caption?: string;
}) {
  const track = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState(0);
  const count = images.length;

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const first = el.firstElementChild as HTMLElement | null;
      if (!first) return;
      const step = first.getBoundingClientRect().width + 20;
      setPos(Math.min(count - 1, Math.max(0, Math.round(el.scrollLeft / step))));
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [count]);

  const slide = (dir: number) => {
    const el = track.current;
    if (!el) return;
    const first = el.firstElementChild as HTMLElement | null;
    const step = (first?.getBoundingClientRect().width || el.clientWidth * 0.7) + 20;
    el.scrollBy({ left: dir * step, behavior: "smooth" });
  };

  if (!count) return null;

  return (
    <figure>
      <div
        ref={track}
        className="no-scrollbar -mx-5 flex snap-x snap-mandatory items-start gap-5 overflow-x-auto px-5 md:mx-0 md:px-0"
      >
        {images.map((img, i) => (
          <div key={i} className="w-[86%] shrink-0 snap-start md:w-[72%]">
            <ZoomImage
              image={img}
              sizes="(min-width: 768px) 70vw, 86vw"
              maxWidth={2400}
              galleryIndex={indexes[i] || 0}
            />
          </div>
        ))}
      </div>
      <div className="mt-4 flex items-center justify-between">
        <span className="num">
          {String(pos + 1).padStart(2, "0")} / {String(count).padStart(2, "0")}
        </span>
        <div className="flex items-center gap-6">
          <button
            onClick={() => slide(-1)}
            aria-label="Previous slide"
            disabled={pos === 0}
            className="display cursor-pointer text-3xl transition-colors hover:text-accent disabled:cursor-default disabled:opacity-25 disabled:hover:text-inherit"
          >
            ←
          </button>
          <button
            onClick={() => slide(1)}
            aria-label="Next slide"
            disabled={pos >= count - 1}
            className="display cursor-pointer text-3xl transition-colors hover:text-accent disabled:cursor-default disabled:opacity-25 disabled:hover:text-inherit"
          >
            →
          </button>
        </div>
      </div>
      {caption && <figcaption className="label mt-2 opacity-70">{caption}</figcaption>}
    </figure>
  );
}
