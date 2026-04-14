/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Отключаем Router Cache для динамических страниц (force-dynamic).
    // Без этого браузер хранит RSC-пейлоад до 30 сек в памяти и не делает
    // новый запрос к серверу даже после revalidateTag().
    staleTimes: {
      dynamic: 0,
    },
  },
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
