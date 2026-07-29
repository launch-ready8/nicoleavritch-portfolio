"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav({ siteTitle, email }: { siteTitle: string; email?: string }) {
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
      <nav className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 md:px-10">
        <Link href="/" className="nav-link transition-opacity hover:opacity-60">
          {links[0].label}
        </Link>
        <div className="flex items-center gap-7 md:gap-10">
          {links.slice(1).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`nav-link transition-opacity hover:opacity-60 ${
                pathname?.startsWith(l.href) ? "underline underline-offset-8" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
          {email && (
            <a href={`mailto:${email}`} className="nav-link hidden transition-opacity hover:opacity-60 md:inline">
              Contact
            </a>
          )}
        </div>
      </nav>
    </header>
  );
}
