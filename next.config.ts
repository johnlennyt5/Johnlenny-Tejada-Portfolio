import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  poweredByHeader: false,
  experimental: {
    // Inline CSS into the HTML: no render-blocking stylesheet request on first paint.
    inlineCss: true,
  },
};

export default nextConfig;
