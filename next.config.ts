import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // The slides are UI screenshots full of small text — the default re-encode
    // at 75 visibly softens them. 95 must be declared here to be usable.
    qualities: [75, 95],
  },
};

export default nextConfig;
