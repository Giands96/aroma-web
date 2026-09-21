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
      // 5 imágenes x 5MB c/u (ver MAX_PRODUCT_IMAGES y MAX_IMAGE_SIZE_BYTES):
      // no bajar de 30mb sin achicar esos límites primero.
      bodySizeLimit: "30mb",
      allowedOrigins: [
        "localhost:3000",
        "127.0.0.1:3000",
        ...developmentServerActionOrigins,
      ],
    },
    viewTransition: true,
  },
  async headers() {
    const securityHeaders = [
      { key: "X-Content-Type-Options", value: "nosniff" },
      { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];
    return [
      {
        source: "/login",
        headers: [
          ...securityHeaders,
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
      {
        source: "/dashboard/:path*",
        headers: [
          ...securityHeaders,
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Cache-Control", value: "no-store" },
        ],
      },
    ];
  },
};

export default nextConfig;
