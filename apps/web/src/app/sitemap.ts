import { MetadataRoute } from 'next'
import { seoApi, SitemapEntry } from '@/lib/api/seo'

export const revalidate = 3600 // ревалидировать раз в час

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  let entries: SitemapEntry[] = []

  try {
    entries = await seoApi.getSitemapData()
  } catch {
    // Если API недоступен — возвращаем только главную
    entries = [
      {
        url: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
        lastModified: new Date().toISOString(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ]
  }

  return entries.map((e) => ({
    url: e.url,
    lastModified: new Date(e.lastModified),
    changeFrequency: e.changeFrequency as MetadataRoute.Sitemap[number]['changeFrequency'],
    priority: e.priority,
  }))
}
