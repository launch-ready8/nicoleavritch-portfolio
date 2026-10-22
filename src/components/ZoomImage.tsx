"use client";

import Image from "next/image";
import { urlFor, type SanityImageSource } from "@/lib/sanity";
import { useGallery } from "@/components/Gallery";

/** Gallery image rendered at natural size; clicking opens the page lightbox. */
export default function ZoomImage({
  image,
  alt = "",
  sizes = "(min-width: 768px) 46vw, 95vw",
  maxWidth = 2600,
  galleryIndex = 0,
  fitHeight = false,
}: {
  image: SanityImageSource;
  alt?: string;
  sizes?: string;
  maxWidth?: number;
  galleryIndex?: number;
  fitHeight?: boolean;
}) {
  const gallery = useGallery();

  const ref: string = image?.asset?._ref || "";
  const dims = ref.match(/-(\d+)x(\d+)-/);
  const w = dims ? parseInt(dims[1]) : 1600;
  const h = dims ? parseInt(dims[2]) : 1000;
  const isGif = ref.endsWith("-gif");
  const src = isGif ? urlFor(image).url() : urlFor(image).width(Math.min(w, maxWidth)).fit("max").auto("format").quality(82).url();

  return (
    <button
      type="button"
      onClick={() => gallery?.openAt(galleryIndex)}
      className={`block cursor-zoom-in border-0 bg-transparent p-0 text-left ${fitHeight ? "h-full w-auto" : "w-full"}`}
      aria-label={alt ? `View larger: ${alt}` : "View image larger"}
    >
      <Image
        src={src}
        alt={alt}
        width={w}
        height={h}
        sizes={sizes}
        quality={82}
        unoptimized={isGif}
        className={fitHeight ? "h-full w-auto" : "h-auto w-full"}
      />
    </button>
  );
}
