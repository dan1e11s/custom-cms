'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Heart, MessageSquare } from 'lucide-react'
import { usersApi } from '@/lib/api/users'
import type { GramPost } from '@/types/gram'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'только что'
  if (m < 60) return `${m} мин. назад`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч. назад`
  return `${Math.floor(h / 24)} дн. назад`
}

export default function MyPostsPage() {
  const [posts, setPosts] = useState<GramPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    usersApi
      .getMyPosts()
      .then(setPosts)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Мои посты</h1>
        <Link
          href="/gram"
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          Перейти в Грам
        </Link>
      </div>

      {loading && <div className="py-16 text-center text-muted-foreground">Загрузка...</div>}

      {!loading && posts.length === 0 && (
        <div className="rounded-xl border border-border bg-card py-16 text-center text-muted-foreground">
          У вас ещё нет постов
        </div>
      )}

      <div className="space-y-3">
        {posts.map((post) => (
          <div key={post.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
            <p className="text-sm leading-relaxed line-clamp-3">{post.content}</p>

            {post.images.length > 0 && (
              <div className="flex gap-2 overflow-x-auto">
                {post.images.slice(0, 3).map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    className="h-20 w-20 rounded-md object-cover shrink-0"
                  />
                ))}
                {post.images.length > 3 && (
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-md bg-muted text-sm text-muted-foreground">
                    +{post.images.length - 3}
                  </div>
                )}
              </div>
            )}

            {post.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {post.tags.map((tag) => (
                  <span
                    key={tag.id}
                    className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary"
                  >
                    #{tag.slug}
                  </span>
                ))}
              </div>
            )}

            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <Heart className="h-3.5 w-3.5" />
                {post._count.likes}
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3.5 w-3.5" />
                {post._count.comments}
              </span>
              <span className="ml-auto">{timeAgo(post.createdAt)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
