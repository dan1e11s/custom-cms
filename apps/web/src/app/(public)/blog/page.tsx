import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { Skeleton } from '@/components/ui/skeleton'
import { PostCard } from '@/components/blog/PostCard'
import { BlogFilters } from '@/components/blog/BlogFilters'
import { CatalogPagination } from '@/components/catalog/CatalogPagination'
import { blogServerApi } from '@/lib/api/blog'
import { SITE_NAME } from '@/lib/seo/config'
import type { BlogTag, BlogCategory, BlogListResponse } from '@/types/blog'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: `Блог | ${SITE_NAME}`,
  description: 'Статьи, новости и полезные материалы',
}

interface Props {
  searchParams: {
    search?: string
    categorySlug?: string
    tag?: string
    page?: string
    sortBy?: string
    sortOrder?: string
  }
}

export default async function BlogPage({ searchParams }: Props) {
  const page = Number(searchParams.page ?? 1)
  const limit = 12

  const [postsData, tags, categories] = await Promise.all([
    blogServerApi
      .getPosts(
        {
          search: searchParams.search,
          categorySlug: searchParams.categorySlug,
          tag: searchParams.tag,
          page,
          limit,
          sortBy: searchParams.sortBy ?? 'publishedAt',
          sortOrder: (searchParams.sortOrder as 'asc' | 'desc') ?? 'desc',
        },
        { revalidate: false },
      )
      .catch((): BlogListResponse => ({ items: [], total: 0, page: 1, limit, pages: 0 })),
    blogServerApi.getTags({ revalidate: 3600 }).catch((): BlogTag[] => []),
    blogServerApi.getCategories({ revalidate: 3600 }).catch((): BlogCategory[] => []),
  ])

  const hasFilters = searchParams.search || searchParams.categorySlug || searchParams.tag

  return (
    <Container className="py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Блог</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {postsData.total > 0
            ? `${postsData.total} ${pluralize(postsData.total, ['статья', 'статьи', 'статей'])}`
            : hasFilters
              ? 'По вашему запросу ничего не найдено'
              : 'Статей пока нет'}
        </p>
      </div>

      {/* Фильтры */}
      <div className="mb-8">
        <Suspense fallback={<Skeleton className="h-20 w-full" />}>
          <BlogFilters tags={tags} categories={categories} />
        </Suspense>
      </div>

      {/* Сетка статей */}
      {postsData.items.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          <p className="text-lg font-medium">Статьи не найдены</p>
          <p className="mt-1 text-sm">Попробуйте изменить параметры поиска</p>
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {postsData.items.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      )}

      {/* Пагинация */}
      {postsData.pages > 1 && (
        <div className="mt-10">
          <Suspense>
            <CatalogPagination page={postsData.page} totalPages={postsData.pages} />
          </Suspense>
        </div>
      )}
    </Container>
  )
}

function pluralize(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return forms[2]
  if (mod10 === 1) return forms[0]
  if (mod10 >= 2 && mod10 <= 4) return forms[1]
  return forms[2]
}
