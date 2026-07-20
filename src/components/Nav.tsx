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
    <header className="sticky top-0 z-50 border-b rule bg-bg/90 backdrop-blur-sm">
      <nav className="mx-auto flex max-w-[1600px] items-center justify-between px-5 py-4 md:px-10">
        <Link href="/" className="mono-label font-medium hover:text-accent transition-colors">
          {initials}.&reg;
        </Link>
        <div className="flex items-center gap-6 md:gap-10">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`mono-label transition-colors hover:text-accent ${
                pathname?.startsWith(l.href) ? "text-accent" : ""
              }`}
            >
              {l.label}
            </Link>
          ))}
          {email && (
            <a
              href={`mailto:${email}`}
              className="mono-label border rule rounded-full px-4 py-2 transition-colors hover:bg-ink hover:text-bg"
            >
              Contact
            </a>
          )}
        </div>
      </nav>
    </header>
  );
}
