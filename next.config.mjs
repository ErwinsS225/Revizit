/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "bcryptjs"],
  },
  // Auth.js v5 importe jose (webapi) qui teste CompressionStream/DecompressionStream,
  // absents du runtime Edge. Auth.js n'utilise pas les JWE compressés → faux positif connu.
  // Ciblé sur jose/deflate.js uniquement : les autres alertes « API Node en Edge » restent visibles.
  webpack: (config) => {
    config.ignoreWarnings = [
      ...(config.ignoreWarnings ?? []),
      { module: /jose[\\/]dist[\\/]webapi[\\/]lib[\\/]deflate\.js$/ },
    ];
    return config;
  },
};

export default nextConfig;
