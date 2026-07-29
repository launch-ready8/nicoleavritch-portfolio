export default function Ticker({ items }: { items: string[] }) {
  const row = (prefix: string) =>
    items.flatMap((item, i) => [
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
