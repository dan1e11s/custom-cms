'use client'

import { useState } from 'react'
import { Quote, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { forumApi } from '@/lib/api/forum'
import { useAuthStore } from '@/store/auth.store'
import { Button } from '@/components/ui/button'
import type { ForumPost } from '@/types/forum'

interface ForumPostCardProps {
  post: ForumPost
  onQuote?: (post: ForumPost) => void
  onDeleted?: (postId: number) => void
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'только что'
  if (m < 60) return `${m} мин. назад`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч. назад`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d} дн. назад`
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function ForumPostCard({ post, onQuote, onDeleted }: ForumPostCardProps) {
  const user = useAuthStore((s) => s.user)
  const [isDeleting, setIsDeleting] = useState(false)

  const canDelete =
    user && (user.id === post.authorId || user.role === 'ADMIN' || user.role === 'MODERATOR')

  const handleDelete = async () => {
    if (!confirm('Удалить это сообщение?')) return
    setIsDeleting(true)
    try {
      await forumApi.deletePost(post.id)
      onDeleted?.(post.id)
    } catch {
      // ignore
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <article
      id={`post-${post.id}`}
      className={cn(
        'flex gap-4 rounded-xl border bg-card p-4 shadow-sm',
        post.isDeleted && 'opacity-60',
      )}
    >
      {/* Аватар */}
      <div className="flex-shrink-0">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary uppercase">
          {post.author.username[0]}
        </div>
      </div>

      {/* Контент */}
      <div className="min-w-0 flex-1">
        {/* Шапка */}
        <div className="mb-2 flex items-baseline gap-2">
          <span className="font-semibold text-sm">@{post.author.username}</span>
          <time className="text-xs text-muted-foreground" dateTime={post.createdAt}>
            {timeAgo(post.createdAt)}
          </time>
          <a
            href={`#post-${post.id}`}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            #{post.id}
          </a>
        </div>

        {/* Тело сообщения */}
        {post.isDeleted ? (
          <p className="text-sm italic text-muted-foreground">Сообщение удалено</p>
        ) : (
          <div
            className="prose prose-sm dark:prose-invert max-w-none text-sm [&_blockquote]:border-l-4 [&_blockquote]:border-muted [&_blockquote]:pl-3 [&_blockquote]:italic [&_blockquote]:text-muted-foreground"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        )}

        {/* Действия */}
        {!post.isDeleted && (
          <div className="mt-3 flex items-center gap-1">
            {user && onQuote && (
              <Button
                variant="ghost"
                size="sm"
                className="h-7 gap-1.5 px-2 text-xs text-muted-foreground"
                onClick={() => onQuote(post)}
              >
                <Quote className="h-3.5 w-3.5" />
                Цитировать
              </Button>
            )}
            {canDelete && (
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto h-7 gap-1.5 px-2 text-xs text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Удалить
              </Button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}
