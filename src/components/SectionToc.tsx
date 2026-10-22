"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; title: string };

/** Typographic index for sectioned case studies: Anton entries, numbered,
 *  the active chapter in full ink with an accent number. Sticky on desktop,
 *  a horizontal chip row on mobile. */
export default function SectionToc({ items, label }: { items: TocItem[]; label?: string }) {
  const [active, setActive] = useState<string>(items[0]?.id || "");

  useEffect(() => {
    const sections = items
      .map((it) => document.getElementById(it.id))
      .filter((el): el is HTMLElement => !!el);
    if (!sections.length) return;

    const onScroll = () => {
      // active = last section whose top has passed the reading line
      const line = window.innerHeight * 0.3;
      let current = sections[0].id;
      for (const el of sections) {
        if (el.getBoundingClientRect().top <= line) current = el.id;
      }
      setActive(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [items]);

  return (
    <>
      {/* desktop rail */}
      <nav className="sticky top-24 hidden self-start pt-1 lg:block" aria-label="Sections">
        {label && <p className="label mb-6 opacity-60">{label}</p>}
        <ol className="grid gap-3.5">
          {items.map((it, i) => {
            const on = it.id === active;
            return (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  className="group flex items-baseline gap-3.5"
                >
                  <span
                    className="num transition-colors duration-200"
                    style={on ? { color: "var(--accent)", opacity: 1 } : undefined}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={`text-[0.95rem] font-semibold uppercase leading-snug tracking-[0.1em] transition-opacity duration-200 ${
                      on ? "opacity-100" : "opacity-50 group-hover:opacity-80"
                    }`}
                  >
                    {it.title}
                  </span>
                </a>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* mobile chip row */}
      <nav className="-mx-5 overflow-x-auto px-5 lg:hidden" aria-label="Sections">
        <div className="flex w-max gap-2 pb-1">
          {items.map((it) => {
            const on = it.id === active;
            return (
              <a
                key={it.id}
                href={`#${it.id}`}
                className="whitespace-nowrap border px-3.5 py-2.5 text-[0.8rem] font-semibold uppercase tracking-[0.08em] transition-colors"
                style={{
                  borderColor: "color-mix(in srgb, var(--ink) 30%, transparent)",
                  background: on ? "var(--ink)" : "transparent",
                  color: on ? "var(--background)" : "inherit",
                }}
              >
                {it.title}
              </a>
            );
          })}
        </div>
      </nav>
    </>
  );
}
