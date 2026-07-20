import Image from "next/image";
import { urlFor, type SanityImageSource } from "@/lib/sanity";

/** Renders a Sanity image at its NATIVE aspect ratio (no square cropping),
 *  and keeps animated GIFs animated by skipping the optimizer for them. */
export default function SmartImage({
  image,
  alt = "",
  sizes = "(min-width: 768px) 46vw, 95vw",
  maxWidth = 1600,
  className = "",
  priority = false,
}: {
  image: SanityImageSource;
  alt?: string;
  sizes?: string;
  maxWidth?: number;
  className?: string;
  priority?: boolean;
}) {
  const ref: string = image?.asset?._ref || "";
  const dims = ref.match(/-(\d+)x(\d+)-/);
  const w = dims ? parseInt(dims[1]) : 1600;
  const h = dims ? parseInt(dims[2]) : 1000;
  const isGif = ref.endsWith("-gif");

  const src = isGif ? urlFor(image).url() : urlFor(image).width(Math.min(w, maxWidth)).fit("max").quality(85).url();

  return (
    <Image
      src={src}
      alt={alt}
      width={w}
      height={h}
      sizes={sizes}
      priority={priority}
      unoptimized={isGif}
      className={`h-auto w-full ${className}`}
    />
  );
}
