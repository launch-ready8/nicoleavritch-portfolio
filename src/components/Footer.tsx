"use client";

import { usePathname } from "next/navigation";
import type { SiteSettings } from "@/lib/sanity";
import Star from "@/components/Star";

export default function Footer({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/studio")) return null;
  return (
    <footer className="border-t-2 rule bg-ink text-bg">
      <div className="mx-auto max-w-[1700px] px-5 py-14 md:px-10 md:py-20">
        <p className="mono-label mb-6 flex items-center gap-3 opacity-70">
          <Star className="h-5 w-5 text-accent" /> Have a project in mind?
        </p>
        {settings.email ? (
          <a
            href={`mailto:${settings.email}`}
            className="display block text-[14vw] leading-none transition-colors hover:text-accent md:text-[9rem]"
          >
            Let&rsquo;s talk<span className="text-accent">.</span>
          </a>
        ) : (
          <span className="display block text-[14vw] leading-none md:text-[9rem]">Let&rsquo;s talk.</span>
        )}
        <div className="mt-14 grid gap-0 border-2 border-bg/40 md:grid-cols-3">
          <p className="mono-label border-b-2 border-bg/40 px-4 py-3 opacity-70 md:border-b-0 md:border-r-2">
            © {new Date().getFullYear()} {settings.siteTitle}
          </p>
          <p className="mono-label border-b-2 border-bg/40 px-4 py-3 opacity-70 md:border-b-0 md:border-r-2">
            Designed with intent, built to update
          </p>
          <div className="flex gap-6 px-4 py-3">
            {settings.socials?.map((s) => (
              <a
                key={`${s.label}-${s.url}`}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="mono-label transition-colors hover:text-accent"
              >
                {s.label} ↗
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
