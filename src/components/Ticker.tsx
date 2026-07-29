export default function Ticker({ items }: { items: string[] }) {
  /* Repeat the item set so each half of the loop is always wider than any
     viewport — otherwise the marquee shows a blank gap before it repeats. */
  const reps = Math.max(3, Math.ceil(18 / Math.max(items.length, 1)));
  const seq = Array.from({ length: reps }).flatMap(() => items);

  const row = (prefix: string) =>
    seq.flatMap((item, i) => [
      <span key={`${prefix}-t-${i}`} className="whitespace-nowrap text-[15px] font-medium uppercase tracking-[0.06em]">
        {item}
      </span>,
      <span key={`${prefix}-a-${i}`} className="text-[13px] opacity-50">
        ✳
      </span>,
    ]);
  return (
    <div className="overflow-hidden border-y border-ink/80 py-3" aria-hidden>
      <div className="marquee-track flex w-max items-center gap-5 pr-5">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}
