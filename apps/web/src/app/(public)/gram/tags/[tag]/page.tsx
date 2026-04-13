import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { GramPostCard } from '@/components/gram/GramPostCard'
import { gramServerApi } from '@/lib/api/gram'
import { SITE_NAME } from '@/lib/seo/config'

export const revalidate = 60

interface Props {
  params: { tag: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  return {
    title: `#${params.tag} | Грам | ${SITE_NAME}`,
  }
}

export default async function GramTagPage({ params }: Props) {
  const posts = await gramServerApi
    .getFeed(20, { revalidate: 60 })
    .then(() =>
      // Используем клиентский serverApi для фильтрации по тегу
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/gram/tags/${params.tag}`, {
        next: { revalidate: 60 },
      }).then((r) => (r.ok ? r.json() : [])),
    )
    .catch(() => [])

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-2xl">
        <div className="mb-6 flex items-center gap-3">
          <Link href="/gram" className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold">#{params.tag}</h1>
            <p className="text-sm text-muted-foreground">
              {posts.length} {posts.length === 1 ? 'пост' : 'постов'}
            </p>
          </div>
        </div>

        {posts.length === 0 ? (
          <p className="text-center text-muted-foreground py-16">
            По тегу #{params.tag} постов не найдено
          </p>
        ) : (
          <div className="space-y-4">
            {posts.map((post: Parameters<typeof GramPostCard>[0]['post']) => (
              <GramPostCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}
