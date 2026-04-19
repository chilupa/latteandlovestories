/** @type {import('next').NextConfig} */
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
let supabaseHost = "localhost";
try {
  if (supabaseUrl) supabaseHost = new URL(supabaseUrl).hostname;
} catch {
  /* ignore */
}

/** Avatar URLs come from Supabase Storage (`*.supabase.co`). Always allow this pattern so
 *  production builds still work if NEXT_PUBLIC_SUPABASE_URL was missing at build time (picomatch syntax). */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
      ...(supabaseHost !== "localhost"
        ? [
            {
              protocol: "https",
              hostname: supabaseHost,
              pathname: "/storage/v1/object/public/**",
            },
          ]
        : []),
    ],
  },
};

export default nextConfig;
