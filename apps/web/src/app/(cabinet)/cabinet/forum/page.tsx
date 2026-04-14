'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usersApi } from '@/lib/api/users'
import type { MyForumActivity } from '@/lib/api/users'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'только что'
  if (m < 60) return `${m} мин. назад`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч. назад`
  return `${Math.floor(h / 24)} дн. назад`
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '').trim()
}

export default function MyForumPage() {
  const [data, setData] = useState<MyForumActivity | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState<'threads' | 'posts'>('threads')

  useEffect(() => {
    usersApi
      .getMyForum()
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Моя активность на форуме</h1>
        <Link
          href="/forum"
          className="rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          Перейти на форум
        </Link>
      </div>

      {/* Табы */}
      <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
        {(['threads', 'posts'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === t
                ? 'bg-background shadow-sm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {t === 'threads'
              ? `Темы (${data?.threads.length ?? 0})`
              : `Сообщения (${data?.posts.length ?? 0})`}
          </button>
        ))}
      </div>

      {loading && <div className="py-16 text-center text-muted-foreground">Загрузка...</div>}

      {/* Темы */}
      {!loading && tab === 'threads' && (
        <div className="space-y-3">
          {data?.threads.length === 0 && (
            <div className="rounded-xl border border-border bg-card py-16 text-center text-muted-foreground">
              Вы ещё не создавали тем
            </div>
          )}
          {data?.threads.map((thread) => (
            <Link
              key={thread.id}
              href={`/forum/${thread.section.slug}/${thread.slug}`}
              className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent/50"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold truncate">{thread.title}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {thread.section.title} · {thread._count.posts} сообщ.
                  </p>
                </div>
                <span className="shrink-0 text-xs text-muted-foreground">
                  {timeAgo(thread.createdAt)}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Сообщения */}
      {!loading && tab === 'posts' && (
        <div className="space-y-3">
          {data?.posts.length === 0 && (
            <div className="rounded-xl border border-border bg-card py-16 text-center text-muted-foreground">
              Вы ещё не писали сообщений
            </div>
          )}
          {data?.posts.map((post) => (
            <Link
              key={post.id}
              href={`/forum/${post.thread.section.slug}/${post.thread.slug}`}
              className="block rounded-xl border border-border bg-card p-4 transition-colors hover:border-primary/50 hover:bg-accent/50"
            >
              <p className="text-xs font-medium text-primary mb-1 truncate">
                → {post.thread.title}
              </p>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {stripHtml(post.content).slice(0, 200)}
              </p>
              <p className="mt-1.5 text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
