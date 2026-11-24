import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /*
   * Cache Components — для сайтов, которые кешируют данные, полученные
   * через server-side fetch(). У нас все данные (Supabase, localStorage)
   * запрашиваются из клиентских компонентов, серверного fetch нет —
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
