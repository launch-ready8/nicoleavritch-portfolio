"use client";

import { usePathname } from "next/navigation";
import type { SiteSettings } from "@/lib/sanity";
import Doodle from "@/components/Doodle";

/** Full color-field footer whose color changes per page, like the reference site. */
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
        <div className="grid gap-12 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="label mb-2 opacity-60">Located</p>
            <p className="text-lg">United States · working remotely, everywhere</p>
          </div>
          <div className="relative">
            <Doodle name="star" className="absolute -top-10 right-[10%] h-9 w-9" strokeWidth={6} />
            <Doodle name="heart" className="absolute -left-12 top-8 hidden h-8 w-8 md:block" strokeWidth={6} />
            {settings.email ? (
              <a href={`mailto:${settings.email}`} className="block text-3xl leading-snug transition-opacity hover:opacity-70 md:text-5xl">
                You&rsquo;re welcome to reach out —<br />
                here&rsquo;s an <span className="underline underline-offset-8">email</span>.
              </a>
            ) : (
              <p className="text-3xl leading-snug md:text-5xl">You&rsquo;re welcome to reach out.</p>
            )}
            <Doodle name="loop" className="mt-4 h-10 w-10" strokeWidth={6} delay={0.4} />
          </div>
        </div>

        <div className="mt-16 flex items-center justify-between border-t pt-6" style={{ borderColor: "color-mix(in srgb, currentColor 30%, transparent)" }}>
          <a href="#top" className="label transition-opacity hover:opacity-60">
            ↑ Back to top
          </a>
          <p className="label opacity-70">
            {settings.siteTitle} © {year}
          </p>
        </div>

        <div className="mt-6 grid gap-6 md:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="label mb-2 opacity-60">Links</p>
            <div className="flex gap-5">
              {settings.socials?.map((s) => (
                <a
                  key={`${s.label}-${s.url}`}
                  href={s.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-base underline underline-offset-4 transition-opacity hover:opacity-60"
                >
                  {s.label}
                </a>
              ))}
            </div>
          </div>
          <div>
            <p className="label mb-2 opacity-60">Action</p>
            <p className="max-w-md text-base leading-relaxed">
              <strong>Good work travels.</strong> If you have a project, a role, or just a hunch we should talk — send it over.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
