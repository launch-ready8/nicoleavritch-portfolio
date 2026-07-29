import type { Metadata } from "next";
import "@fontsource/anton";
import "@fontsource-variable/archivo";
import "@fontsource/bebas-neue";
import "@fontsource/archivo-black";
import "@fontsource-variable/space-grotesk";
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
      "Creative Director and Senior Designer working across brand identity, campaigns, packaging, and art direction.",
  };
}

const PAIRINGS: Record<string, { display: string; body: string }> = {
  editorial: { display: "'Anton'", body: "'Archivo Variable'" },
  poster: { display: "'Bebas Neue'", body: "'Archivo Variable'" },
  grotesque: { display: "'Archivo Black'", body: "'Space Grotesk Variable'" },
};

function fontFormat(url: string) {
  if (url.endsWith(".woff2")) return "woff2";
  if (url.endsWith(".woff")) return "woff";
  if (url.endsWith(".otf")) return "opentype";
  return "truetype";
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const s = await getSettings();
  const t = s.theme;
  const preset = PAIRINGS[t.fontPairing] || PAIRINGS.editorial;

  /* Font resolution, per slot: uploaded file > Google Fonts name > preset */
  let displayFamily = preset.display;
  let bodyFamily = preset.body;
  const googleFamilies: string[] = [];
  const fontFaces: string[] = [];

  if (t.headlineFontUrl) {
    fontFaces.push(
      `@font-face{font-family:'NA Custom Headline';src:url('${t.headlineFontUrl}') format('${fontFormat(t.headlineFontUrl)}');font-display:swap;}`
    );
    displayFamily = "'NA Custom Headline'";
  } else if (t.headlineGoogleFont) {
    googleFamilies.push(t.headlineGoogleFont);
    displayFamily = `'${t.headlineGoogleFont}'`;
  }

  if (t.bodyFontUrl) {
    fontFaces.push(
      `@font-face{font-family:'NA Custom Body';src:url('${t.bodyFontUrl}') format('${fontFormat(t.bodyFontUrl)}');font-display:swap;}`
    );
    bodyFamily = "'NA Custom Body'";
  } else if (t.bodyGoogleFont) {
    googleFamilies.push(t.bodyGoogleFont);
    bodyFamily = `'${t.bodyGoogleFont}'`;
  }

  const googleHref =
    googleFamilies.length > 0
      ? `https://fonts.googleapis.com/css2?${googleFamilies
          .map((f) => `family=${encodeURIComponent(f).replace(/%20/g, "+")}`)
          .join("&")}&display=swap`
      : null;

  const themeStyle = {
    "--background": t.background,
    "--ink": t.ink,
    "--accent": t.accent,
    "--accent2": t.accent2,
    "--surface": t.surface,
    "--font-display": displayFamily,
    "--font-body": bodyFamily,
  } as React.CSSProperties;

  return (
    <html lang="en" style={themeStyle}>
      <body className="flex min-h-screen flex-col">
        {googleHref && (
          <>
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            <link rel="stylesheet" href={googleHref} />
          </>
        )}
        {fontFaces.length > 0 && <style dangerouslySetInnerHTML={{ __html: fontFaces.join("\n") }} />}
        <Nav siteTitle={s.siteTitle} email={s.email} />
        <main className="flex-1">{children}</main>
        <Footer settings={s} />
      </body>
    </html>
  );
}
