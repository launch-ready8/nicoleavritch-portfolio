import Link from "next/link";

/** Static, clickable band under the featured grid — big "View all work"
 *  that inverts on hover. No motion. */
export default function ViewAllBand({ text = "View all work" }: { text?: string }) {
  return (
    <Link
      href="/work"
      aria-label={text}
      className="view-all-band group flex items-center justify-center gap-5 border-y rule py-6 md:gap-8 md:py-8"
    >
      <span aria-hidden className="text-2xl md:text-4xl">
        ✳
      </span>
      <span className="display text-4xl md:text-6xl">{text}</span>
      <span
        aria-hidden
        className="text-3xl transition-transform duration-300 group-hover:translate-x-2 md:text-5xl"
      >
        →
      </span>
    </Link>
  );
}
