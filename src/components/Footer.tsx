"use client";

import { usePathname } from "next/navigation";
import type { SiteSettings } from "@/lib/sanity";
import Doodle from "@/components/Doodle";

/** Full color-field footer whose color changes per page. */
export default function Footer({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname() || "/";
  if (pathname.startsWith("/studio")) return null;

  const scheme = pathname === "/"
    ? { bg: "#1B7754", text: "var(--background)" }
    : pathname.startsWith("/about")
      ? { bg: "var(--accent2)", text: "var(--ink)" }
      : pathname.startsWith("/work/")
        ? { bg: "var(--ink)", text: "var(--background)" }
        : { bg: "var(--accent)", text: "var(--ink)" };

  const year = new Date().getFullYear();

  return (
    <footer style={{ background: scheme.bg, color: scheme.text }}>
      <div className="mx-auto max-w-[1500px] px-5 py-16 md:px-10 md:py-20">
        <div className="relative">
          <Doodle name="spark" className="absolute -top-6 right-[6%] h-9 w-9" strokeWidth={6} />
          <Doodle name="paw" className="absolute -top-2 right-[16%] hidden h-9 w-9 md:block" strokeWidth={5} delay={0.3} />
          <p className="label mb-4 opacity-60">Contact</p>
          {settings.email && (
            <a
              href={`mailto:${settings.email}`}
              className="block break-all text-3xl leading-snug underline underline-offset-8 transition-opacity hover:opacity-70 md:text-6xl"
            >
              {settings.email.replace("@", " [at] ")}
            </a>
          )}
          <Doodle name="peach" className="mt-5 h-10 w-10" strokeWidth={5} delay={0.5} />
        </div>

        <div
          className="mt-14 flex flex-col gap-4 border-t pt-6 md:flex-row md:items-center md:justify-between"
          style={{ borderColor: "color-mix(in srgb, currentColor 30%, transparent)" }}
        >
          <a href="#top" className="label transition-opacity hover:opacity-60">
            ↑ Back to top
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
