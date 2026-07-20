export default function Marquee({ items }: { items: string[] }) {
  const row = (prefix: string) =>
    items.flatMap((item, i) => [
      <span key={`${prefix}-t-${i}`} className="display text-2xl md:text-4xl whitespace-nowrap">
        {item}
      </span>,
      <span key={`${prefix}-s-${i}`} className="text-accent text-xl md:text-3xl">
        ✦
      </span>,
    ]);
  return (
    <div className="overflow-hidden border-y rule bg-surface py-4" aria-hidden>
      <div className="marquee-track flex w-max items-center gap-8 pr-8">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}
