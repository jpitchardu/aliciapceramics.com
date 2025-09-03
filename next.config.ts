import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // {
      //   source: "/",
      //   destination: "/comissions",
      //   permanent: false,
      // },
    ];
  },
};

export default nextConfig;
