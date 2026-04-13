import type { FaqItem } from '@/types/blocks'
import type { Page } from '@/types/pages'
import type { Product } from '@/types/catalog'
import type { BlogPost } from '@/types/blog'
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

export function buildArticleSchema(post: BlogPost): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    ...(post.excerpt && { description: stripHtml(post.excerpt) }),
    ...(post.coverImage && { image: [post.coverImage] }),
    datePublished: post.publishedAt ?? post.createdAt,
    dateModified: post.createdAt,
    author: {
      '@type': 'Person',
      name: post.author.username,
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: BASE_URL,
    },
    url: `${BASE_URL}/blog/${post.slug}`,
    inLanguage: 'ru',
  }
}

export function buildArticleBreadcrumbSchema(post: BlogPost): object {
  const items: object[] = [
    { '@type': 'ListItem', position: 1, name: SITE_NAME, item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Блог', item: `${BASE_URL}/blog` },
  ]

  if (post.category) {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: post.category.name,
      item: `${BASE_URL}/blog?categorySlug=${post.category.slug}`,
    })
    items.push({
      '@type': 'ListItem',
      position: 4,
      name: post.title,
      item: `${BASE_URL}/blog/${post.slug}`,
    })
  } else {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: post.title,
      item: `${BASE_URL}/blog/${post.slug}`,
    })
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
  }
}

export function buildProductSchema(product: Product): object {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description ?? undefined,
    image: product.images.length > 0 ? product.images : undefined,
    offers: {
      '@type': 'Offer',
      price: product.price ?? '0',
      priceCurrency: 'RUB',
      availability: product.inStock
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
    },
  }
}

export function buildProductBreadcrumbSchema(product: Product): object {
  const items: object[] = [
    { '@type': 'ListItem', position: 1, name: SITE_NAME, item: BASE_URL },
    { '@type': 'ListItem', position: 2, name: 'Каталог', item: `${BASE_URL}/catalog` },
  ]

  if (product.category) {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: product.category.name,
      item: `${BASE_URL}/catalog?categorySlug=${product.category.slug}`,
    })
    items.push({
      '@type': 'ListItem',
      position: 4,
      name: product.name,
      item: `${BASE_URL}/catalog/${product.category.slug}/${product.slug}`,
    })
  } else {
    items.push({
      '@type': 'ListItem',
      position: 3,
      name: product.name,
      item: `${BASE_URL}/catalog/uncategorized/${product.slug}`,
    })
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items,
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
