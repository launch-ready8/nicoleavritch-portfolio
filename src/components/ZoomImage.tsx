"use client";

import Image from "next/image";
import { urlFor, type SanityImageSource } from "@/lib/sanity";
import { useGallery } from "@/components/Gallery";

/** Gallery image rendered at natural size; clicking opens the page lightbox. */
export default function ZoomImage({
  image,
  alt = "",
  sizes = "(min-width: 768px) 46vw, 95vw",
  maxWidth = 1600,
  galleryIndex = 0,
}: {
  image: SanityImageSource;
  alt?: string;
  sizes?: string;
  maxWidth?: number;
  galleryIndex?: number;
}) {
  const gallery = useGallery();

  const ref: string = image?.asset?._ref || "";
  const dims = ref.match(/-(\d+)x(\d+)-/);
  const w = dims ? parseInt(dims[1]) : 1600;
  const h = dims ? parseInt(dims[2]) : 1000;
  const isGif = ref.endsWith("-gif");
  const src = isGif ? urlFor(image).url() : urlFor(image).width(Math.min(w, maxWidth)).fit("max").quality(85).url();

  return (
    <button
      type="button"
      onClick={() => gallery?.openAt(galleryIndex)}
      className="block w-full cursor-zoom-in border-0 bg-transparent p-0 text-left"
      aria-label={alt ? `View larger: ${alt}` : "View image larger"}
    >
      <Image
        src={src}
        alt={alt}
        width={w}
        height={h}
        sizes={sizes}
        unoptimized={isGif}
        className="h-auto w-full"
      />
    </button>
  );
}
