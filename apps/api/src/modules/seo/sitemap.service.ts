import { Injectable, Logger } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PageStatus } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'

export interface SitemapEntry {
  url: string
  lastModified: Date
  changeFrequency: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority: number
}

@Injectable()
export class SitemapService {
  private readonly logger = new Logger(SitemapService.name)
  private readonly baseUrl = process.env.FRONTEND_URL ?? 'http://localhost:3000'

  constructor(private readonly prisma: PrismaService) {}

  // ── Данные для Next.js sitemap.ts ─────────────────────────────────────────

  async getSitemapData(): Promise<SitemapEntry[]> {
    const pages = await this.prisma.page.findMany({
      where: { status: PageStatus.PUBLISHED },
      select: { slug: true, updatedAt: true },
      orderBy: { updatedAt: 'desc' },
    })

    const entries: SitemapEntry[] = [
      {
        url: this.baseUrl,
        lastModified: new Date(),
        changeFrequency: 'daily',
        priority: 1.0,
      },
    ]

    for (const page of pages) {
      entries.push({
        url: `${this.baseUrl}/${page.slug}`,
        lastModified: page.updatedAt,
        changeFrequency: 'weekly',
        priority: 0.8,
      })
    }

    return entries
  }

  // ── Генерация XML sitemap ─────────────────────────────────────────────────

  async buildXml(): Promise<string> {
    const entries = await this.getSitemapData()

    const urls = entries
      .map(
        (e) => `  <url>
    <loc>${escapeXml(e.url)}</loc>
    <lastmod>${e.lastModified.toISOString().split('T')[0]}</lastmod>
    <changefreq>${e.changeFrequency}</changefreq>
    <priority>${e.priority.toFixed(1)}</priority>
  </url>`,
      )
      .join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>`
  }

  // ── Получить XML из кэша (или сгенерировать) ──────────────────────────────

  async getXml(): Promise<string> {
    const settings = await this.prisma.seoSettings.findFirst()

    if (settings?.sitemapCache) {
      return settings.sitemapCache
    }

    return this.rebuild()
  }

  // ── Пересобрать и закэшировать ────────────────────────────────────────────

  async rebuild(): Promise<string> {
    const xml = await this.buildXml()

    await this.prisma.seoSettings.upsert({
      where: { id: 1 },
      create: { id: 1, sitemapCache: xml, sitemapBuiltAt: new Date() },
      update: { sitemapCache: xml, sitemapBuiltAt: new Date() },
    })

    this.logger.log(`Sitemap rebuilt: ${xml.length} bytes`)
    return xml
  }

  // ── Cron: пересобирать каждый час ────────────────────────────────────────

  @Cron(CronExpression.EVERY_HOUR)
  async scheduledRebuild() {
    await this.rebuild()
  }
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
