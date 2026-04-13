import type { BlockConfig } from '@/types/blocks'
import type { BannerBlockData } from '@/types/blocks'

/**
 * Убирает HTML-теги из строки
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim()
}

/**
 * Извлекает description из первых блоков страницы (для авто-SEO)
 */
export function extractDescription(blocks: BlockConfig[]): string {
  const enabled = blocks.filter((b) => b.enabled).sort((a, b) => a.order - b.order)

  for (const block of enabled) {
    if (block.type === 'banner') {
      const data = block.data as BannerBlockData
      if (data.description) return data.description
      if (data.subheading) return data.subheading
    }
    if (block.type === 'info') {
      const d = block.data as { text?: string }
      if (d.text) return stripHtml(d.text).slice(0, 160)
    }
  }

  return ''
}
