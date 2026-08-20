import type { NextConfig } from "next";

const developmentServerActionOrigins =
  process.env.NODE_ENV === "production" ? [] : ["*.brs.devtunnels.ms"];

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: "30mb",
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        ...developmentServerActionOrigins,
      ],
    },
    viewTransition: true,
  }
};

export default nextConfig;
