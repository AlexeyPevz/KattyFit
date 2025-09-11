const { withSentryConfig } = require('@sentry/nextjs')

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['@sentry/nextjs'],
  },
  images: {
    domains: ['localhost', 'via.placeholder.com'],
    formats: ['image/webp', 'image/avif'],
  },
  // Настройки для PWA
  async headers() {
    return [
      {
        source: '/sw.js',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ]
  },
  // Настройки для оптимизации
  webpack: (config, { dev, isServer }) => {
    // Оптимизация для production
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
          },
        },
      }
    }
    
    return config
  },
}

// Sentry configuration
const sentryWebpackPluginOptions = {
  // Дополнительные настройки для Sentry webpack plugin
  silent: true, // Отключаем логи Sentry в консоли
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  
  // Настройки для source maps
  widenClientFileUpload: true,
  hideSourceMaps: true,
  disableServerWebpackPlugin: false,
  disableClientWebpackPlugin: false,
  
  // Настройки для автоматического релиза
  release: process.env.SENTRY_RELEASE,
  deploy: {
    env: process.env.NODE_ENV,
  },
}

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions)