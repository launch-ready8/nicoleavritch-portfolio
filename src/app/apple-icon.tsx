import { ImageResponse } from "next/og";
import { iconSetup } from "./icon-shared";

export const runtime = "nodejs";
export const revalidate = 3600;
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

/* iOS home-screen icon: same mark, larger. */
export default async function AppleIcon() {
  const { initials, data, ink, paper } = await iconSetup();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: ink,
          color: paper,
          fontFamily: "Headline",
          fontSize: 128,
          lineHeight: 1,
          letterSpacing: -3,
          paddingTop: 6,
        }}
      >
        {initials}
      </div>
    ),
    { ...size, fonts: [{ name: "Headline", data, style: "normal", weight: 400 }] }
  );
}
