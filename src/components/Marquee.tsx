export default function Marquee({ items, dark = false }: { items: string[]; dark?: boolean }) {
  const row = (prefix: string) =>
    items.flatMap((item, i) => [
      <span key={`${prefix}-t-${i}`} className="display text-2xl md:text-4xl whitespace-nowrap">
        {item}
      </span>,
      <span key={`${prefix}-s-${i}`} className={`text-xl md:text-3xl ${dark ? "text-accent2" : "text-accent"}`}>
        ✦
      </span>,
    ]);
  return (
    <div
      className={`overflow-hidden border-y-2 rule py-4 ${dark ? "bg-ink text-bg" : "bg-surface text-ink"}`}
      aria-hidden
    >
      <div className="marquee-track flex w-max items-center gap-8 pr-8">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}
