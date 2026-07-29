"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { SiteSettings } from "@/lib/sanity";

/** Structured studio footer: link columns up top, massive wordmark at the base,
 *  utility bar underneath. Black field, off-white text, no accent color. */
export default function Footer({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/studio")) return null;

  const L = settings.labels || {};
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: "var(--ink)", color: "var(--background)" }}>
      <div className="mx-auto max-w-[1500px] px-5 pt-16 md:px-10 md:pt-20">
        {/* link columns */}
        <div className="grid gap-10 pb-16 md:grid-cols-3 md:pb-24">
          <div>
            <p className="label mb-4 opacity-50">Menu</p>
            <nav className="grid gap-2">
              <Link href="/" className="text-base transition-opacity hover:opacity-60 md:text-lg">Home</Link>
              <Link href="/work" className="text-base transition-opacity hover:opacity-60 md:text-lg">Work</Link>
              <Link href="/about" className="text-base transition-opacity hover:opacity-60 md:text-lg">About</Link>
            </nav>
          </div>
          <div>
            <p className="label mb-4 opacity-50">{L.footerContact || "Contact"}</p>
            {settings.email && (
              <a
                href={`mailto:${settings.email}`}
                className="block text-base underline underline-offset-4 transition-opacity hover:opacity-60 md:text-lg"
              >
                {settings.email.replace("@", " [at] ")}
              </a>
            )}
            <div className="mt-2 grid gap-1.5">
              {settings.socials?.map((s) => (
                <a
                  key={`${s.label}-${s.url}`}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block text-base transition-opacity hover:opacity-60 md:text-lg"
                >
                  {s.label} ↗
                </a>
              ))}
            </div>
          </div>
          <div className="md:text-right">
            <p className="label mb-4 opacity-50">Currently</p>
            <p className="text-base opacity-80 md:text-lg">{settings.tagline}</p>
            <p className="mt-1 text-base opacity-50 md:text-lg">Working worldwide</p>
          </div>
        </div>

        {/* massive wordmark at the base */}
        <div className="overflow-hidden">
          <p className="display -mb-[1.5vw] text-center text-[12.5vw] leading-[0.8] opacity-95">
            {settings.siteTitle}
          </p>
        </div>
      </div>

      {/* utility bar */}
      <div style={{ borderTop: "1px solid color-mix(in srgb, var(--background) 25%, transparent)" }}>
        <div className="mx-auto flex max-w-[1500px] flex-col gap-2 px-5 py-4 md:flex-row md:items-center md:justify-between md:px-10">
          <p className="label opacity-50">© {year} {settings.siteTitle}</p>
          <a href="#top" className="label transition-opacity hover:opacity-60">
            {L.backToTop || "Back to top ↑"}
          </a>
        </div>
      </div>
    </footer>
  );
}
