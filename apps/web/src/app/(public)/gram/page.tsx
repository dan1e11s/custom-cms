import { Suspense } from 'react'
import type { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { Skeleton } from '@/components/ui/skeleton'
import { GramFeed } from '@/components/gram/GramFeed'
import { gramServerApi } from '@/lib/api/gram'
import { SITE_NAME } from '@/lib/seo/config'
import type { GramPost } from '@/types/gram'

export const metadata: Metadata = {
  title: `Нельзя Грам | ${SITE_NAME}`,
  description: 'Лента коротких постов сообщества',
}

// Первая страница генерируется сервером для SEO,
// далее клиент подхватывает infinite scroll через React Query
export const revalidate = 60

export default async function GramPage() {
  let initialPosts: GramPost[] = []
  let initialNextCursor: number | undefined

  try {
    const data = await gramServerApi.getFeed(20, { revalidate: 60 })
    initialPosts = data.posts
    initialNextCursor = data.nextCursor
  } catch {
    // API недоступен — показываем пустую ленту
  }

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Нельзя Грам</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Лента постов сообщества — делитесь моментами
          </p>
        </div>

        <Suspense
          fallback={
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-48 w-full rounded-xl" />
              ))}
            </div>
          }
        >
          <GramFeed initialPosts={initialPosts} initialNextCursor={initialNextCursor} />
        </Suspense>
      </div>
    </Container>
  )
}
