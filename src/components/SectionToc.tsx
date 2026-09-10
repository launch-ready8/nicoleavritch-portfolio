"use client";

import { useEffect, useState } from "react";

export type TocItem = { id: string; title: string };

/** Sticky table of contents for sectioned case studies (Conner Nielander-style
 *  left rail). Highlights the section currently in view; smooth-scrolls on click.
 *  On mobile it renders as a horizontal chip row above the content instead. */
export default function SectionToc({ items, projectLabel }: { items: TocItem[]; projectLabel?: string }) {
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
      <nav className="sticky top-28 hidden self-start md:block" aria-label="Sections">
        {projectLabel && <p className="label mb-5 opacity-60">{projectLabel}</p>}
        <ul className="grid gap-2.5">
          {items.map((it, i) => {
            const on = it.id === active;
            return (
              <li key={it.id}>
                <a
                  href={`#${it.id}`}
                  className={`flex items-baseline gap-3 transition-opacity duration-200 ${
                    on ? "opacity-100" : "opacity-45 hover:opacity-80"
                  }`}
                >
                  <span className="num">{String(i + 1).padStart(2, "0")}</span>
                  <span className={`text-[0.95rem] font-medium uppercase tracking-[0.06em] ${on ? "underline underline-offset-4" : ""}`}>
                    {it.title}
                  </span>
                </a>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* mobile chip row */}
      <nav className="-mx-5 overflow-x-auto px-5 md:hidden" aria-label="Sections">
        <div className="flex w-max gap-2 pb-1">
          {items.map((it) => {
            const on = it.id === active;
            return (
              <a
                key={it.id}
                href={`#${it.id}`}
                className="label whitespace-nowrap border px-3 py-2 transition-colors"
                style={{
                  borderColor: "color-mix(in srgb, var(--ink) 25%, transparent)",
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
