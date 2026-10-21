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
      <span className="display text-4xl tracking-[0.02em] md:text-6xl">{text}</span>
    </Link>
  );
}
