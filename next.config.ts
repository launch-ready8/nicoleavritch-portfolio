import type { NextConfig } from "next";

const sanityProject = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "2h8pgj67";
const sanityDataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
    qualities: [75, 90],
  },
  async rewrites() {
    return [
      /* CMS-uploaded font files, served same-origin: browsers require CORS
         headers to apply cross-origin fonts and Sanity's file CDN doesn't
         send them, so we proxy the file through the site's own domain. */
      {
        source: "/fonts/custom/:file",
        destination: `https://cdn.sanity.io/files/${sanityProject}/${sanityDataset}/:file`,
      },
    ];
  },
};

export default nextConfig;
