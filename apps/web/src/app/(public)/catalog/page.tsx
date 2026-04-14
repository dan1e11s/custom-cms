import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { Skeleton } from '@/components/ui/skeleton'
import { FadeIn } from '@/components/ui/fade-in'
import { CategorySidebar } from '@/components/catalog/CategorySidebar'
import { CatalogFilters } from '@/components/catalog/CatalogFilters'
import { CatalogPagination } from '@/components/catalog/CatalogPagination'
import { ProductCard } from '@/components/catalog/ProductCard'
import { catalogServerApi } from '@/lib/api/catalog'
import { SITE_NAME } from '@/lib/seo/config'
import type { Category } from '@/types/catalog'

// SSR — фильтры меняются с каждым запросом
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: `Каталог товаров | ${SITE_NAME}`,
  description: 'Полный каталог товаров. Удобный поиск, фильтрация по цене и категориям.',
}

interface Props {
  searchParams: {
    categorySlug?: string
    search?: string
    minPrice?: string
    maxPrice?: string
    inStock?: string
    page?: string
    sortBy?: string
    sortOrder?: string
  }
}

export default async function CatalogPage({ searchParams }: Props) {
  const page = Number(searchParams.page ?? 1)
  const limit = 24

  // Идентифицируем categoryId по slug, если передан
  let categoryId: number | undefined
  let activeCategory: Category | undefined

  const [tree, productsData] = await Promise.all([
    catalogServerApi.getCategoryTree().catch(() => [] as Category[]),
    catalogServerApi
      .getProducts(
        {
          search: searchParams.search,
          minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
          maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
          inStock: searchParams.inStock === 'true' ? true : undefined,
          page,
          limit,
          sortBy: (searchParams.sortBy as 'createdAt' | 'price' | 'name') ?? 'createdAt',
          sortOrder: (searchParams.sortOrder as 'asc' | 'desc') ?? 'desc',
        },
        { revalidate: false },
      )
      .catch(() => ({ items: [], total: 0, page: 1, limit, pages: 0 })),
  ])

  // Если передан categorySlug — найти категорию в дереве для фильтра и sidebar
  if (searchParams.categorySlug) {
    const flat = flattenTree(tree)
    activeCategory = flat.find((c) => c.slug === searchParams.categorySlug)
    categoryId = activeCategory?.id

    // Перезапрашиваем с categoryId
    if (categoryId) {
      try {
        const filtered = await catalogServerApi.getProducts(
          {
            categoryId,
            search: searchParams.search,
            minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
            maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
            inStock: searchParams.inStock === 'true' ? true : undefined,
            page,
            limit,
            sortBy: (searchParams.sortBy as 'createdAt' | 'price' | 'name') ?? 'createdAt',
            sortOrder: (searchParams.sortOrder as 'asc' | 'desc') ?? 'desc',
          },
          { revalidate: false },
        )
        Object.assign(productsData, filtered)
      } catch {
        // используем предыдущий результат
      }
    }
  }

  return (
    <Container className="py-8">
      {/* Заголовок */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold">
          {activeCategory ? activeCategory.name : 'Каталог товаров'}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {productsData.total > 0
            ? `${productsData.total} товаров`
            : 'По вашему запросу ничего не найдено'}
        </p>
      </div>

      <div className="flex gap-8">
        {/* Sidebar */}
        <aside className="hidden w-56 shrink-0 lg:block">
          <CategorySidebar tree={tree} activeCategorySlug={searchParams.categorySlug} />
        </aside>

        {/* Контент */}
        <div className="min-w-0 flex-1 space-y-6">
          {/* Фильтры — client component */}
          <Suspense fallback={<Skeleton className="h-10 w-full" />}>
            <CatalogFilters />
          </Suspense>

          {/* Сетка товаров */}
          {productsData.items.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <p className="text-lg font-medium">Товары не найдены</p>
              <p className="mt-1 text-sm">Попробуйте изменить параметры поиска или фильтры</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {productsData.items.map((product, i) => (
                <FadeIn key={product.id} delay={i * 0.04}>
                  <ProductCard product={product} />
                </FadeIn>
              ))}
            </div>
          )}

          {/* Пагинация */}
          {productsData.pages > 1 && (
            <Suspense>
              <CatalogPagination page={productsData.page} totalPages={productsData.pages} />
            </Suspense>
          )}
        </div>
      </div>
    </Container>
  )
}

// ── Утилита: плоский список из дерева ─────────────────────────────────────────

function flattenTree(tree: Category[]): Category[] {
  const result: Category[] = []
  const traverse = (nodes: Category[]) => {
    for (const node of nodes) {
      result.push(node)
      if (node.children?.length) traverse(node.children)
    }
  }
  traverse(tree)
  return result
}
