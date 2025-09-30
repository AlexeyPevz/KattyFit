/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: false, // Включаем ESLint
  },
  typescript: {
    ignoreBuildErrors: false, // Включаем проверку TypeScript
  },
  images: {
    unoptimized: false,
    domains: ['localhost', 'supabase.co', 'via.placeholder.com', 'api.contentstudio.io'],
    formats: ['image/avif', 'image/webp'],
  },
  // Оптимизация для v0 preview
  experimental: {
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'],
  },
  // Редиректы для v0
  async redirects() {
    return [
      {
        source: '/v0-preview',
        destination: '/preview',
        permanent: false,
      },
    ]
  },
}

export default nextConfig
