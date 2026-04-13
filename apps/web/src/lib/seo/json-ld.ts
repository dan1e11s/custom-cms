import type { FaqItem } from '@/types/blocks'
import type { Page } from '@/types/pages'
import { BASE_URL, SITE_NAME } from './config'
import { stripHtml } from './utils'

export function buildJsonLd(page: Page): object | object[] {
  const schemas: object[] = [buildBreadcrumbSchema(page)]

  if (page.seo?.schemaType === 'FAQPage') {
    const faqBlock = page.blocks.find((b) => b.type === 'faq' && b.enabled)
    if (faqBlock) {
      const items = (faqBlock.data as { items: FaqItem[] }).items
      schemas.push(buildFaqSchema(items))
    }
  }

  if (page.seo?.schemaType === 'WebPage') {
    schemas.push(buildWebPageSchema(page))
  }

  return schemas.length === 1 ? schemas[0] : schemas
}

function buildBreadcrumbSchema(page: Page): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: SITE_NAME,
        item: BASE_URL,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: page.seo?.h1 || page.title,
        item: `${BASE_URL}/${page.slug}`,
      },
    ],
  }
}

function buildFaqSchema(items: FaqItem[]): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: stripHtml(item.answer),
      },
    })),
  }
}

function buildWebPageSchema(page: Page): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.seo?.metaTitle || page.title,
    description: page.seo?.metaDesc || '',
    url: `${BASE_URL}/${page.slug}`,
    inLanguage: 'ru',
  }
}
