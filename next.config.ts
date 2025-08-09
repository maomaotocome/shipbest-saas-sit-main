import createMDX from "@next/mdx";
import { type NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";
const withNextIntl = createNextIntlPlugin();

const withMDX = createMDX({});
const nextConfig: NextConfig = {
  //trailingSlash: true,
  pageExtensions: ["js", "jsx", "mdx", "ts", "tsx"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        port: "",
      },
      {
        protocol: "https",
        hostname: "picsum.photos",
        port: "",
      },
      {
        protocol: "https",
        hostname: "v3.fal.media",
        port: "",
      },
      {
        protocol: "https",
        hostname: "filesystem.site",
        port: "",
      },
      {
        protocol: "https",
        hostname: "**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "47890",
      },
    ],
  },
  transpilePackages: ["next-mdx-remote"],
  turbopack: {},
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        os: false,
        zlib: false,
        stream: false,
        child_process: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },
};

// Compose multiple plugins together
export default withNextIntl(withMDX(nextConfig));
