"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { urlFor, type SanityImageSource } from "@/lib/sanity";

/** Gallery image that opens full-screen on click (Esc or click to close). */
export default function ZoomImage({
  image,
  alt = "",
  sizes = "(min-width: 768px) 46vw, 95vw",
  maxWidth = 1600,
}: {
  image: SanityImageSource;
  alt?: string;
  sizes?: string;
  maxWidth?: number;
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const ref: string = image?.asset?._ref || "";
  const dims = ref.match(/-(\d+)x(\d+)-/);
  const w = dims ? parseInt(dims[1]) : 1600;
  const h = dims ? parseInt(dims[2]) : 1000;
  const isGif = ref.endsWith("-gif");
  const src = isGif ? urlFor(image).url() : urlFor(image).width(Math.min(w, maxWidth)).fit("max").quality(85).url();
  const fullSrc = isGif ? src : urlFor(image).width(Math.min(w, 2400)).fit("max").quality(90).url();
  const veryTall = h > w * 2;

  const img = (
    <Image
      src={src}
      alt={alt}
      width={w}
      height={h}
      sizes={sizes}
      unoptimized={isGif}
      className={veryTall ? "h-auto w-auto max-h-[82vh]" : "h-auto w-full"}
    />
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="block w-full cursor-zoom-in border-0 bg-transparent p-0 text-left"
        aria-label={alt ? `View larger: ${alt}` : "View image larger"}
      >
        {veryTall ? <span className="flex justify-center">{img}</span> : img}
      </button>
      {open && (
        <div
          className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center p-4 md:p-10"
          style={{ background: "color-mix(in srgb, var(--ink) 92%, transparent)" }}
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={fullSrc} alt={alt} className="max-h-full max-w-full object-contain" />
          <span className="display absolute right-5 top-4 text-3xl" style={{ color: "var(--background)" }} aria-hidden>
            ✕
          </span>
        </div>
      )}
    </>
  );
}
