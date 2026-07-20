"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Nav({ siteTitle, email }: { siteTitle: string; email?: string }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/studio")) return null;

  const initials = siteTitle
    .split(" ")
    .map((w) => w[0])
    .join(".");

  const links = [
    { href: "/work", label: "Work" },
    { href: "/about", label: "About" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b-2 rule bg-bg/95 text-ink backdrop-blur-sm">
      <nav className="flex items-stretch justify-between">
        <Link
          href="/"
          className="mono-label flex items-center border-r-2 rule px-5 py-4 font-medium transition-colors hover:bg-ink hover:text-bg md:px-8"
        >
          {initials}.&reg;
        </Link>
        <div className="flex items-stretch">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`mono-label flex items-center border-l-2 rule px-5 transition-colors hover:bg-ink hover:text-bg md:px-8 ${
                pathname?.startsWith(l.href) ? "bg-ink text-bg" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
          {email && (
            <a
              href={`mailto:${email}`}
              className="mono-label flex items-center border-l-2 rule bg-accent px-5 text-ink transition-colors hover:bg-ink hover:text-bg md:px-8"
            >
              Contact ↗
            </a>
          )}
        </div>
      </nav>
    </header>
  );
}
