import type { Metadata } from "next";
import "@fontsource/anton";
import "@fontsource-variable/archivo";
import "@fontsource/bebas-neue";
import "@fontsource/archivo-black";
import "@fontsource-variable/space-grotesk";
import "@fontsource/ibm-plex-mono/400.css";
import "@fontsource/ibm-plex-mono/500.css";
import { getSettings } from "@/lib/sanity";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import "./globals.css";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: `${s.siteTitle} — ${s.tagline}`,
    description:
      s.heroLine ||
      "Senior Designer and Brand Strategist working across brand identity, campaigns, packaging, and art direction.",
  };
}

const PAIRINGS: Record<string, { display: string; body: string }> = {
  editorial: { display: "'Anton'", body: "'Archivo Variable'" },
  poster: { display: "'Bebas Neue'", body: "'Archivo Variable'" },
  grotesque: { display: "'Archivo Black'", body: "'Space Grotesk Variable'" },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const pairing = PAIRINGS[s.theme.fontPairing] || PAIRINGS.editorial;

  const themeStyle = {
    "--background": s.theme.background,
    "--ink": s.theme.ink,
    "--accent": s.theme.accent,
    "--accent2": s.theme.accent2,
    "--surface": s.theme.surface,
    "--font-display": pairing.display,
    "--font-body": pairing.body,
  } as React.CSSProperties;

  return (
    <html lang="en" style={themeStyle}>
      <body>
        <Nav siteTitle={s.siteTitle} email={s.email} />
        <main className="min-h-screen">{children}</main>
        <Footer settings={s} />
      </body>
    </html>
  );
}
