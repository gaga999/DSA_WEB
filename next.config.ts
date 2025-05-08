import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  output: "export", // 啟用靜態匯出
  assetPrefix: process.env.NODE_ENV === "production" ? "/DSA_WEB" : "", // 設定子路徑
  basePath: process.env.NODE_ENV === "production" ? "/DSA_WEB" : "",
};

export default nextConfig;
