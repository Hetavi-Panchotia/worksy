import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Prevent worker process file lock contention on Windows OneDrive
  experimental: {
    cpus: 1,
  },
};

export default nextConfig;
