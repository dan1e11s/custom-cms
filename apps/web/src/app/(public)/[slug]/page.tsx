import { BlockRenderer } from '@/components/blocks/BlockRenderer'
import { serverApi } from '@/lib/api/server'
import { buildJsonLd } from '@/lib/seo/json-ld'
import { buildPageMetadata } from '@/lib/seo/metadata'
import type { Page, PagesListResponse } from '@/types/pages'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

// ISR: если страница не предгенерирована — генерируем на лету и кешируем на час
export const revalidate = 3600

interface Props {
  params: { slug: string }
}

// Предгенерация 100 последних опубликованных страниц при сборке
export async function generateStaticParams() {
  try {
    const data = await serverApi.get<PagesListResponse>('/pages?limit=100', {
      revalidate: false, // не кешируем — нужен актуальный список при билде
    })
    return data.items.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const page = await serverApi.get<Page>(`/pages/${params.slug}`, {
      tags: [`page-${params.slug}`],
      revalidate,
    })
    return buildPageMetadata(page)
  } catch {
    return { title: 'Страница не найдена' }
  }
}

export default async function LandingPage({ params }: Props) {
  let page: Page

  try {
    page = await serverApi.get<Page>(`/pages/${params.slug}`, {
      tags: [`page-${params.slug}`],
      revalidate,
    })
  } catch {
    notFound()
  }

  const schemas = buildJsonLd(page)
  const schemasArray = Array.isArray(schemas) ? schemas : [schemas]

  return (
    <>
      {schemasArray.map((schema, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      ))}
      <BlockRenderer blocks={page.blocks} />
    </>
  )
}
