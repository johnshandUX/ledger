import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.0.208"],
  transpilePackages: ["@johnshandux/ledger-design-system"],
};

export default nextConfig;
