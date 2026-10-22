import { ImageResponse } from "next/og";
import { iconSetup } from "./icon-shared";

export const runtime = "nodejs";
export const revalidate = 3600;
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/* Browser-tab favicon: initials in the headline font on an ink tile. */
export default async function Icon() {
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
          fontSize: 46,
          lineHeight: 1,
          letterSpacing: -1,
          paddingTop: 2,
        }}
      >
        {initials}
      </div>
    ),
    { ...size, fonts: [{ name: "Headline", data, style: "normal", weight: 400 }] }
  );
}
