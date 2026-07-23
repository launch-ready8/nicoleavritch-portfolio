"use client";

import { usePathname } from "next/navigation";
import type { SiteSettings } from "@/lib/sanity";

/** Full color-field footer whose color changes per page. */
export default function Footer({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/studio")) return null;

  const scheme = pathname.startsWith("/work/")
    ? { bg: "var(--ink)", text: "var(--background)" }
    : { bg: "var(--accent)", text: "var(--background)" };

  const L = settings.labels || {};
  const year = new Date().getFullYear();

  return (
    <footer style={{ background: scheme.bg, color: scheme.text }}>
      <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-20">
        <div className="relative">
          <span className="display absolute -top-4 right-[6%] text-5xl md:text-6xl" aria-hidden>↗</span>
          <p className="label mb-4 opacity-60">{L.footerContact || "Contact"}</p>
          {settings.email && (
            <a
              href={`mailto:${settings.email}`}
              className="block break-all text-3xl leading-snug underline underline-offset-8 transition-opacity hover:opacity-70 md:text-6xl"
            >
              {settings.email.replace("@", " [at] ")}
            </a>
          )}
        </div>

        <div
          className="mt-14 flex flex-col gap-4 border-t pt-6 md:flex-row md:items-center md:justify-between"
          style={{ borderColor: "color-mix(in srgb, currentColor 30%, transparent)" }}
        >
          <a href="#top" className="label transition-opacity hover:opacity-60">
            {L.backToTop || "↑ Back to top"}
          </a>
          <div className="flex gap-6">
            {settings.socials?.map((s) => (
              <a
                key={`${s.label}-${s.url}`}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="label underline underline-offset-4 transition-opacity hover:opacity-60"
              >
                {s.label}
              </a>
            ))}
          </div>
          <p className="label opacity-70">
            {settings.siteTitle} © {year}
          </p>
        </div>
      </div>
    </footer>
  );
}
