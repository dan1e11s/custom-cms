'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { MessageCircle, Reply, Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { blogApi } from '@/lib/api/blog'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'
import type { BlogComment } from '@/types/blog'

interface CommentsProps {
  slug: string
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
  return new Date(iso).toLocaleDateString('ru-RU')
}

// ── Один комментарий ──────────────────────────────────────────────────────────

function CommentItem({
  comment,
  slug,
  depth = 0,
  onAdded,
}: {
  comment: BlogComment
  slug: string
  depth?: number
  onAdded: (c: BlogComment, parentId?: number) => void
}) {
  const user = useAuthStore((s) => s.user)
  const [showReply, setShowReply] = useState(false)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)

  const handleReply = async () => {
    if (!text.trim()) return
    setSending(true)
    try {
      const created = await blogApi.addComment(slug, { content: text, parentId: comment.id })
      onAdded(created, comment.id)
      setText('')
      setShowReply(false)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className={cn('flex gap-3', depth > 0 && 'ml-8 border-l pl-4')}>
      {/* Аватар */}
      <div className="mt-0.5 flex-shrink-0">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-semibold uppercase text-muted-foreground">
          {comment.author.username[0]}
        </div>
      </div>

      <div className="flex-1 space-y-1.5">
        {/* Шапка */}
        <div className="flex items-center gap-2 text-sm">
          <span className="font-medium">{comment.author.username}</span>
          <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
        </div>

        {/* Текст */}
        <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-line">
          {comment.content}
        </p>

        {/* Ответить */}
        {user && depth === 0 && (
          <button
            onClick={() => setShowReply((v) => !v)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            <Reply className="h-3.5 w-3.5" />
            Ответить
          </button>
        )}

        {/* Форма ответа */}
        {showReply && (
          <div className="flex gap-2 pt-1">
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ваш ответ..."
              rows={2}
              className="text-sm"
            />
            <div className="flex flex-col gap-1">
              <Button
                size="icon"
                variant="default"
                onClick={handleReply}
                disabled={sending || !text.trim()}
              >
                {sending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
              <Button size="icon" variant="ghost" onClick={() => setShowReply(false)}>
                ✕
              </Button>
            </div>
          </div>
        )}

        {/* Ответы */}
        {(comment.replies ?? []).length > 0 && (
          <div className="space-y-4 pt-2">
            {(comment.replies ?? []).map((reply) => (
              <CommentItem
                key={reply.id}
                comment={reply}
                slug={slug}
                depth={depth + 1}
                onAdded={onAdded}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ── Основной компонент ────────────────────────────────────────────────────────

export function Comments({ slug }: CommentsProps) {
  const user = useAuthStore((s) => s.user)
  const [comments, setComments] = useState<BlogComment[]>([])
  const [loading, setLoading] = useState(true)
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    blogApi
      .getComments(slug)
      .then(setComments)
      .catch(() => setError('Не удалось загрузить комментарии'))
      .finally(() => setLoading(false))
  }, [slug])

  const handleAdded = useCallback((created: BlogComment, parentId?: number) => {
    if (!parentId) {
      setComments((prev) => [...prev, { ...created, replies: [] }])
    } else {
      setComments((prev) =>
        prev.map((c) =>
          c.id === parentId ? { ...c, replies: [...(c.replies ?? []), created] } : c,
        ),
      )
    }
  }, [])

  const handleSubmit = async () => {
    if (!text.trim()) return
    setSending(true)
    try {
      const created = await blogApi.addComment(slug, { content: text })
      handleAdded(created)
      setText('')
    } catch {
      setError('Не удалось отправить комментарий')
    } finally {
      setSending(false)
    }
  }

  return (
    <section className="space-y-6">
      <h2 className="flex items-center gap-2 text-xl font-bold">
        <MessageCircle className="h-5 w-5" />
        Комментарии
        {comments.length > 0 && (
          <span className="text-base font-normal text-muted-foreground">({comments.length})</span>
        )}
      </h2>

      {error && <p className="text-sm text-red-500">{error}</p>}

      {/* Список */}
      {loading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Загрузка комментариев...
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-muted-foreground">Комментариев пока нет. Будьте первым!</p>
      ) : (
        <div className="space-y-6 divide-y">
          {comments.map((c) => (
            <div key={c.id} className="pt-4 first:pt-0">
              <CommentItem comment={c} slug={slug} onAdded={handleAdded} />
            </div>
          ))}
        </div>
      )}

      {/* Форма нового комментария */}
      <div className="rounded-lg border p-4">
        {user ? (
          <div className="space-y-3">
            <p className="text-sm font-medium">Написать комментарий</p>
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Ваш комментарий..."
              rows={3}
            />
            <Button onClick={handleSubmit} disabled={sending || !text.trim()}>
              {sending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Отправить
            </Button>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            <Link href="/login" className="font-medium text-primary hover:underline">
              Войдите
            </Link>
            , чтобы оставить комментарий
          </p>
        )}
      </div>
    </section>
  )
}
