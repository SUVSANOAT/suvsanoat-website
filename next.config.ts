import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Современные форматы: AVIF/WebP вместо тяжёлых PNG
    formats: ["image/avif", "image/webp"],
    // Год кэширования оптимизированных вариантов
    minimumCacheTTL: 31536000,
    deviceSizes: [360, 480, 640, 828, 1080, 1200, 1920],
    imageSizes: [64, 128, 256, 384],
  },

  compress: true,
  poweredByHeader: false,

  async headers() {
    return [
      {
        // Долгий кэш для статики из /public
        source: "/:file*.(png|jpg|jpeg|webp|avif|svg|ico)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
