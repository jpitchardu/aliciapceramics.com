import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/",
        destination: "/commisions",
        permanent: false,
      },
      {
        source: "wordpress/*",
        destination: "https://www.youtube.com/watch?v=xm3YgoEiEDc",
        permanent: true,
      },
      {
        source: "wp-admin/*",
        destination: "https://www.youtube.com/watch?v=xm3YgoEiEDc",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
