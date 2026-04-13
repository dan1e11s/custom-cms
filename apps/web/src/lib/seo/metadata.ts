import type { Metadata } from 'next'
import type { Page } from '@/types/pages'
import { BASE_URL, DEFAULT_OG_IMAGE, SITE_NAME } from './config'
import { extractDescription } from './utils'

export function buildPageMetadata(page: Page): Metadata {
  const seo = page.seo

  const title = seo?.metaTitle || page.title
  const description = seo?.metaDesc || extractDescription(page.blocks)
  const canonical = seo?.canonical || `${BASE_URL}/${page.slug}`
  const ogImage = seo?.ogImage || DEFAULT_OG_IMAGE

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      title: seo?.ogTitle || title,
      description: seo?.ogDesc || description,
      url: canonical,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630 }],
      type: 'website',
      locale: 'ru_RU',
    },
    twitter: {
      card: 'summary_large_image',
      title: seo?.ogTitle || title,
      description: seo?.ogDesc || description,
      images: [ogImage],
    },
    robots: seo?.noindex ? { index: false, follow: false } : { index: true, follow: true },
  }
}
