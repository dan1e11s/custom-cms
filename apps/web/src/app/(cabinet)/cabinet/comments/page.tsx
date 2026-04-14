'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usersApi } from '@/lib/api/users'
import type { MyComment } from '@/lib/api/users'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'только что'
  if (m < 60) return `${m} мин. назад`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч. назад`
  return `${Math.floor(h / 24)} дн. назад`
}

function truncate(text: string, len = 120): string {
  return text.length > len ? text.slice(0, len) + '...' : text
}

export default function MyCommentsPage() {
  const [comments, setComments] = useState<MyComment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    usersApi
      .getMyComments()
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Мои комментарии</h1>

      {loading && <div className="py-16 text-center text-muted-foreground">Загрузка...</div>}

      {!loading && comments.length === 0 && (
        <div className="rounded-xl border border-border bg-card py-16 text-center text-muted-foreground">
          У вас ещё нет комментариев
        </div>
      )}

      <div className="space-y-3">
        {comments.map((c) => (
          <div key={c.id} className="rounded-xl border border-border bg-card p-4 space-y-2">
            {/* Контент комментария */}
            <p className="text-sm leading-relaxed">{truncate(c.content)}</p>

            {/* К чему относится */}
            <div className="rounded-md bg-muted/50 px-3 py-2 text-xs text-muted-foreground">
              {c.gramPost && (
                <span>
                  Комментарий к посту в Граме:{' '}
                  <Link href="/gram" className="text-primary hover:underline">
                    {truncate(c.gramPost.content, 60)}
                  </Link>
                </span>
              )}
              {c.blogPost && (
                <span>
                  Комментарий к статье:{' '}
                  <Link href={`/blog/${c.blogPost.slug}`} className="text-primary hover:underline">
                    {c.blogPost.title}
                  </Link>
                </span>
              )}
              {!c.gramPost && !c.blogPost && <span>Комментарий к удалённому контенту</span>}
            </div>

            <p className="text-xs text-muted-foreground">{timeAgo(c.createdAt)}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
