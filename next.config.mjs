/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "plus.unsplash.com" },
      // Images téléversées par l'admin dans Supabase Storage.
      // Le sous-domaine exact est <PROJECT_REF>.supabase.co : le motif
      // "*.supabase.co" le couvre sans dépendre de la référence du projet.
      { protocol: "https", hostname: "*.supabase.co", pathname: "/storage/v1/object/public/**" },
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
