export default function Ticker({ items }: { items: string[] }) {
  const row = (prefix: string) =>
    items.flatMap((item, i) => [
      <span key={`${prefix}-t-${i}`} className="whitespace-nowrap text-2xl md:text-4xl">
        {item}
      </span>,
      <span key={`${prefix}-a-${i}`} className="text-2xl opacity-40 md:text-4xl">
        →
      </span>,
    ]);
  return (
    <div className="overflow-hidden py-6" aria-hidden>
      <div className="marquee-track flex w-max items-center gap-6 pr-6">
        {row("a")}
        {row("b")}
      </div>
    </div>
  );
}
