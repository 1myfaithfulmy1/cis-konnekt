import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Cache Components — для сайтов, которые кешируют данные с сервера.
   * У нас нет сервера и запросов за данными (всё в seed.ts и localStorage),
   * поэтому эта функция только мешает — отключаем её.
   */
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
