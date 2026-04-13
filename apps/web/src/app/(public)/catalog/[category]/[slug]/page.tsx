import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CheckCircle, XCircle, Tag } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Badge } from '@/components/ui/badge'
import { ProductCard } from '@/components/catalog/ProductCard'
import { ProductGallery } from '@/components/catalog/ProductGallery'
import { catalogServerApi } from '@/lib/api/catalog'
import { buildProductSchema, buildProductBreadcrumbSchema } from '@/lib/seo/json-ld'
import { BASE_URL, SITE_NAME } from '@/lib/seo/config'
import type { Product, ProductsListResponse } from '@/types/catalog'

export const revalidate = 3600

interface Props {
  params: { category: string; slug: string }
}

// ── Предгенерация статических путей ──────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const data = await catalogServerApi.getProducts({ limit: 100 }, { revalidate: false })
    return data.items.map((p) => ({
      category: p.category?.slug ?? 'uncategorized',
      slug: p.slug,
    }))
  } catch {
    return []
  }
}

// ── Метаданные ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const product = await catalogServerApi.getProductBySlug(params.slug, {
      tags: [`product-${params.slug}`],
      revalidate,
    })

    const title = product.seoTitle || `${product.name} | ${SITE_NAME}`
    const description =
      product.seoDesc || product.description || `Купить ${product.name} с доставкой`
    const image = product.images[0]
    const canonical = `${BASE_URL}/catalog/${params.category}/${params.slug}`

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        images: image ? [{ url: image, width: 1200, height: 630 }] : [],
        type: 'website',
      },
    }
  } catch {
    return { title: 'Товар не найден' }
  }
}

// ── Страница ──────────────────────────────────────────────────────────────────

export default async function ProductPage({ params }: Props) {
  let product: Product

  try {
    product = await catalogServerApi.getProductBySlug(params.slug, {
      tags: [`product-${params.slug}`],
      revalidate,
    })
  } catch {
    notFound()
  }

  const related = await catalogServerApi
    .getRelated(params.slug, { revalidate })
    .catch(() => [] as Product[])

  const price = product.price ? parseFloat(product.price) : null
  const oldPrice = product.oldPrice ? parseFloat(product.oldPrice) : null
  const discount = price && oldPrice ? Math.round((1 - price / oldPrice) * 100) : null

  const formatPrice = (val: number) =>
    new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'RUB',
      maximumFractionDigits: 0,
    }).format(val)

  const productSchema = buildProductSchema(product)
  const breadcrumbSchema = buildProductBreadcrumbSchema(product)

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Container className="py-8">
        {/* Хлебные крошки */}
        <nav
          aria-label="Breadcrumb"
          className="mb-6 flex items-center gap-2 text-sm text-muted-foreground"
        >
          <Link href="/" className="hover:text-foreground">
            Главная
          </Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-foreground">
            Каталог
          </Link>
          {product.category && (
            <>
              <span>/</span>
              <Link
                href={`/catalog?categorySlug=${product.category.slug}`}
                className="hover:text-foreground"
              >
                {product.category.name}
              </Link>
            </>
          )}
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>

        {/* Основной контент */}
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Галерея */}
          <ProductGallery images={product.images} productName={product.name} />

          {/* Информация о товаре */}
          <div className="space-y-6">
            <div>
              {product.category && (
                <Link
                  href={`/catalog?categorySlug=${product.category.slug}`}
                  className="mb-2 inline-flex items-center gap-1 text-xs text-primary hover:underline"
                >
                  <Tag className="h-3 w-3" />
                  {product.category.name}
                </Link>
              )}
              <h1 className="text-2xl font-bold leading-snug sm:text-3xl">{product.name}</h1>
            </div>

            {/* Наличие */}
            <div className="flex items-center gap-2">
              {product.inStock ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium text-green-600">В наличии</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Нет в наличии</span>
                </>
              )}
            </div>

            {/* Цена */}
            {price !== null ? (
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-bold">{formatPrice(price)}</span>
                {oldPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    {formatPrice(oldPrice)}
                  </span>
                )}
                {discount && (
                  <Badge className="bg-red-500 text-white hover:bg-red-500">-{discount}%</Badge>
                )}
              </div>
            ) : (
              <p className="text-lg text-muted-foreground">Цена по запросу</p>
            )}

            {/* Описание */}
            {product.description && (
              <div className="space-y-1">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Описание
                </h2>
                <p className="text-sm leading-relaxed text-foreground/80">{product.description}</p>
              </div>
            )}

            {/* Характеристики */}
            {product.attributes && Object.keys(product.attributes).length > 0 && (
              <div className="space-y-2">
                <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Характеристики
                </h2>
                <dl className="divide-y rounded-lg border">
                  {Object.entries(product.attributes).map(([key, value]) => (
                    <div key={key} className="flex gap-4 px-4 py-2.5 text-sm">
                      <dt className="w-40 shrink-0 text-muted-foreground">{key}</dt>
                      <dd className="font-medium">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}
          </div>
        </div>

        {/* Похожие товары */}
        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="mb-6 text-xl font-bold">Похожие товары</h2>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {related.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </section>
        )}
      </Container>
    </>
  )
}
