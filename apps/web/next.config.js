/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // MinIO / локальный S3
      { protocol: 'http', hostname: 'localhost', port: '9000' },
      { protocol: 'http', hostname: '127.0.0.1', port: '9000' },
      // Cloudflare R2 / любой S3-совместимый хост (добавьте домен при деплое)
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
      // Общий wildcard для локальной разработки через env-переменную
      { protocol: 'https', hostname: '**' },
    ],
  },
}

module.exports = nextConfig
