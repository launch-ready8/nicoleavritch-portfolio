"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav({ siteTitle, email }: { siteTitle: string; email?: string }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/studio")) return null;

  const links = [
    { href: "/", label: "Home" },
    { href: "/work", label: "Work" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-bg/85 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-[1500px] items-center justify-between px-5 py-4 md:px-10">
        <Link href="/" className="label transition-colors hover:text-accent">
          {links[0].label}
        </Link>
        <div className="flex items-center gap-7 md:gap-10">
          {links.slice(1).map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`label transition-colors hover:text-accent ${
                pathname?.startsWith(l.href) ? "text-accent" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
          {email && (
            <a href={`mailto:${email}`} className="label hidden transition-colors hover:text-accent md:inline">
              Contact
            </a>
          )}
        </div>
      </nav>
    </header>
  );
}
