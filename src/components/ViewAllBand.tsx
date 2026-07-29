import Link from "next/link";

/** Clickable marquee band under the featured grid — a big, unmissable
 *  "View all work" slider that links to the Work page. */
export default function ViewAllBand({ text = "View all work" }: { text?: string }) {
  const row = (prefix: string) =>
    Array.from({ length: 8 }).map((_, i) => (
      <span key={`${prefix}-${i}`} className="flex items-center gap-8">
        <span className="display whitespace-nowrap text-4xl md:text-6xl">{text}</span>
        <span className="text-2xl md:text-3xl" aria-hidden>
          ✳
        </span>
      </span>
    ));
  return (
    <Link
      href="/work"
      aria-label={text}
      className="view-all-band block overflow-hidden border-y rule py-4 md:py-6"
    >
      <div className="marquee-track flex w-max items-center gap-8 pr-8">
        {row("a")}
        {row("b")}
      </div>
    </Link>
  );
}
