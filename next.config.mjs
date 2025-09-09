/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: false,
    domains: ['localhost', 'supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
}

export default nextConfig
