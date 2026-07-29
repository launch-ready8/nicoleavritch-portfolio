"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { urlFor, type SanityImageSource } from "@/lib/sanity";

/** Page-level lightbox: click any image to open it full screen, then use the
 *  side arrows (or ← → keys) to move through every image on the page. */

type GalleryCtx = { openAt: (index: number) => void } | null;
const Ctx = createContext<GalleryCtx>(null);
export const useGallery = () => useContext(Ctx);

function fullSrcOf(image: SanityImageSource) {
  const ref: string = image?.asset?._ref || "";
  if (ref.endsWith("-gif")) return urlFor(image).url();
  const dims = ref.match(/-(\d+)x(\d+)-/);
  const w = dims ? parseInt(dims[1]) : 2000;
  return urlFor(image).width(Math.min(w, 2400)).fit("max").quality(90).url();
}

export default function GalleryProvider({
  images,
  children,
}: {
  images: SanityImageSource[];
  children: React.ReactNode;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const count = images.length;

  const step = useCallback(
    (dir: 1 | -1) => setIndex((i) => (i === null ? i : (i + dir + count) % count)),
    [count]
  );

  useEffect(() => {
    if (index === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIndex(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [index, step]);

  return (
    <Ctx.Provider value={{ openAt: setIndex }}>
      {children}
      {index !== null && images[index] && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: "color-mix(in srgb, var(--ink) 94%, transparent)" }}
          role="dialog"
          aria-modal="true"
        >
          <button
            type="button"
            onClick={() => setIndex(null)}
            className="absolute inset-0 h-full w-full cursor-zoom-out border-0 bg-transparent"
            aria-label="Close"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={fullSrcOf(images[index])}
            alt=""
            className="pointer-events-none relative max-h-[88vh] max-w-[86vw] object-contain md:max-w-[80vw]"
          />
          {count > 1 && (
            <>
              <button
                type="button"
                onClick={() => step(-1)}
                aria-label="Previous image"
                className="display absolute left-3 top-1/2 -translate-y-1/2 border-0 bg-transparent p-4 text-4xl transition-opacity hover:opacity-60 md:left-8 md:text-6xl"
                style={{ color: "var(--background)" }}
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => step(1)}
                aria-label="Next image"
                className="display absolute right-3 top-1/2 -translate-y-1/2 border-0 bg-transparent p-4 text-4xl transition-opacity hover:opacity-60 md:right-8 md:text-6xl"
                style={{ color: "var(--background)" }}
              >
                →
              </button>
            </>
          )}
          <button
            type="button"
            onClick={() => setIndex(null)}
            aria-label="Close"
            className="display absolute right-5 top-4 border-0 bg-transparent text-3xl transition-opacity hover:opacity-60"
            style={{ color: "var(--background)" }}
          >
            ✕
          </button>
          <span className="label absolute bottom-5 left-1/2 -translate-x-1/2 opacity-70" style={{ color: "var(--background)" }}>
            {index + 1} / {count}
          </span>
        </div>
      )}
    </Ctx.Provider>
  );
}
