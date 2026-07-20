"use client";

import { usePathname } from "next/navigation";
import type { SiteSettings } from "@/lib/sanity";

export default function Footer({ settings }: { settings: SiteSettings }) {
  const pathname = usePathname();
  if (pathname?.startsWith("/studio")) return null;
  return (
    <footer className="bg-ink text-bg">
      <div className="mx-auto max-w-[1600px] px-5 py-16 md:px-10 md:py-24">
        <p className="mono-label mb-6 opacity-70">Have a project in mind?</p>
        {settings.email ? (
          <a
            href={`mailto:${settings.email}`}
            className="display block text-[14vw] leading-none text-bg transition-colors hover:text-accent md:text-[8rem]"
          >
            Let&rsquo;s talk
          </a>
        ) : (
          <span className="display block text-[14vw] leading-none md:text-[8rem]">Let&rsquo;s talk</span>
        )}
        <div className="mt-16 flex flex-col gap-4 border-t border-bg/20 pt-6 md:flex-row md:items-center md:justify-between">
          <p className="mono-label opacity-70">
            © {new Date().getFullYear()} {settings.siteTitle}
          </p>
          <div className="flex gap-6">
            {settings.socials?.map((s) => (
              <a
                key={s.url}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                className="mono-label transition-colors hover:text-accent"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
