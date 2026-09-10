"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav({
  siteTitle,
  email,
  workItems = [],
}: {
  siteTitle: string;
  email?: string;
  workItems?: { title: string; slug: string }[];
}) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 90);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (pathname?.startsWith("/studio")) return null;

  const links = [
    { href: "/", label: "Home" },
    { href: "/work", label: "Work" },
    { href: "/about", label: "About" },
  ];

  return (
    <header
      className="sticky top-0 z-50 transition-colors duration-300"
      style={{
        background: scrolled
          ? "var(--background)"
          : "color-mix(in srgb, var(--background) 85%, transparent)",
        boxShadow: scrolled ? "0 1px 0 color-mix(in srgb, var(--ink) 15%, transparent)" : "none",
        backdropFilter: "blur(4px)",
      }}
    >
      {/* links distributed across the full width, editorial-style */}
      <nav className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 md:px-10">
        <Link href="/" className="nav-link transition-opacity hover:opacity-60">
          {links[0].label}
        </Link>
        {links.slice(1).map((l) =>
            l.href === "/work" && workItems.length > 0 ? (
              <span key={l.href} className="contents">
              {/* mobile: plain link (no hover on touch) */}
              <Link
                href={l.href}
                className={`nav-link transition-opacity hover:opacity-60 md:hidden ${
                  pathname?.startsWith(l.href) ? "underline underline-offset-8" : ""
                }`}
              >
                {l.label}
              </Link>
              {/* desktop: Work + hover dropdown of top projects */}
              <div className="group relative hidden md:block">
                <Link
                  href={l.href}
                  className={`nav-link transition-opacity hover:opacity-60 ${
                    pathname?.startsWith(l.href) ? "underline underline-offset-8" : ""
                  }`}
                >
                  {l.label}
                </Link>
                <div className="invisible absolute left-1/2 top-full -translate-x-1/2 pt-4 opacity-0 transition-all duration-200 group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100">
                  <div
                    className="min-w-[260px] p-2"
                    style={{
                      background: "var(--background)",
                      border: "1px solid color-mix(in srgb, var(--ink) 20%, transparent)",
                      boxShadow: "0 12px 32px color-mix(in srgb, var(--ink) 12%, transparent)",
                    }}
                  >
                    {workItems.map((p, i) => (
                      <Link
                        key={p.slug}
                        href={`/work/${p.slug}`}
                        className="flex items-baseline gap-3 px-3 py-2.5 transition-opacity hover:opacity-60"
                      >
                        <span className="num">{String(i + 1).padStart(2, "0")}</span>
                        <span className="text-[0.95rem] font-medium">{p.title}</span>
                      </Link>
                    ))}
                    <Link
                      href="/work"
                      className="label block border-t px-3 pb-2 pt-3 opacity-60 transition-opacity hover:opacity-100"
                      style={{ borderColor: "color-mix(in srgb, var(--ink) 15%, transparent)" }}
                    >
                      Explore more projects →
                    </Link>
                  </div>
                </div>
              </div>
              </span>
            ) : (
              <Link
                key={l.href}
                href={l.href}
                className={`nav-link transition-opacity hover:opacity-60 ${
                  pathname?.startsWith(l.href) ? "underline underline-offset-8" : ""
                }`}
              >
                {l.label}
              </Link>
            )
        )}
        {email && (
          <a href={`mailto:${email}`} className="nav-link hidden transition-opacity hover:opacity-60 md:inline">
            Contact
          </a>
        )}
      </nav>
    </header>
  );
}
