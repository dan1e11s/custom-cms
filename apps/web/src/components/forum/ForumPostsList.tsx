'use client'

import { useCallback, useRef, useState } from 'react'
import Link from 'next/link'
import { Loader2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { ForumPostCard } from './ForumPostCard'
import { forumApi } from '@/lib/api/forum'
import { useForumSocket } from '@/lib/hooks/useForumSocket'
import { useAuthStore } from '@/store/auth.store'
import type { ForumPost, ForumPostsResponse } from '@/types/forum'

interface ForumPostsListProps {
  threadId: number
  threadSlug: string
  isLocked: boolean
  initialData: ForumPostsResponse
  page: number
}

export function ForumPostsList({
  threadId,
  threadSlug,
  isLocked,
  initialData,
  page,
}: ForumPostsListProps) {
  const user = useAuthStore((s) => s.user)
  const [posts, setPosts] = useState<ForumPost[]>(initialData.items)
  const [replyContent, setReplyContent] = useState('')
  const [quotedPost, setQuotedPost] = useState<ForumPost | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [typingUser, setTypingUser] = useState<string | null>(null)
  const typingTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const replyRef = useRef<HTMLTextAreaElement>(null)

  // ── WebSocket ─────────────────────────────────────────────────────────────

  const { emitTyping } = useForumSocket({
    threadId,
    onNewPost: useCallback(
      (post: ForumPost) => {
        // Добавляем в конец только если мы на последней странице
        if (page === initialData.pages || initialData.pages === 0) {
          setPosts((prev) => (prev.some((p) => p.id === post.id) ? prev : [...prev, post]))
        }
      },
      [page, initialData.pages],
    ),
    onUserTyping: useCallback(({ username }: { threadId: number; username: string }) => {
      setTypingUser(username)
      if (typingTimer.current) clearTimeout(typingTimer.current)
      typingTimer.current = setTimeout(() => setTypingUser(null), 3000)
    }, []),
  })

  // ── Reply handlers ────────────────────────────────────────────────────────

  const handleQuote = useCallback((post: ForumPost) => {
    setQuotedPost(post)
    setTimeout(() => replyRef.current?.focus(), 50)
  }, [])

  const handleDeleted = useCallback((postId: number) => {
    setPosts((prev) => prev.map((p) => (p.id === postId ? { ...p, isDeleted: true } : p)))
  }, [])

  const handleTyping = () => {
    emitTyping()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!replyContent.trim() || submitting) return
    setSubmitting(true)

    try {
      const post = await forumApi.addPost(threadId, {
        content: replyContent.trim(),
        quotePostId: quotedPost?.id,
      })
      // Добавляем локально (WS тоже придёт, дедуп по id)
      setPosts((prev) => (prev.some((p) => p.id === post.id) ? prev : [...prev, post]))
      setReplyContent('')
      setQuotedPost(null)
      // Скролл к новому посту
      setTimeout(() => {
        document
          .getElementById(`post-${post.id}`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }, 100)
    } catch {
      // ignore
    } finally {
      setSubmitting(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-3">
      {/* Список сообщений */}
      {posts.length === 0 ? (
        <p className="py-12 text-center text-muted-foreground">Сообщений пока нет</p>
      ) : (
        posts.map((post) => (
          <ForumPostCard
            key={post.id}
            post={post}
            onQuote={!isLocked ? handleQuote : undefined}
            onDeleted={handleDeleted}
          />
        ))
      )}

      {/* Typing indicator */}
      {typingUser && (
        <p className="text-xs text-muted-foreground italic px-1">@{typingUser} печатает…</p>
      )}

      {/* Форма ответа */}
      {!isLocked && user ? (
        <form onSubmit={handleSubmit} className="mt-6 rounded-xl border bg-card p-4 shadow-sm">
          <h3 className="mb-3 text-sm font-semibold">Ответить</h3>

          {/* Превью цитаты */}
          {quotedPost && (
            <div className="mb-2 flex items-start gap-2 rounded-lg border-l-4 border-muted bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
              <div className="flex-1 min-w-0">
                <span className="font-medium">@{quotedPost.author.username}:</span>{' '}
                <span
                  className="line-clamp-2"
                  dangerouslySetInnerHTML={{
                    __html: quotedPost.content.replace(/<[^>]*>/g, ' ').slice(0, 150),
                  }}
                />
              </div>
              <button
                type="button"
                onClick={() => setQuotedPost(null)}
                className="flex-shrink-0 text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
          )}

          <Textarea
            ref={replyRef}
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            onKeyUp={handleTyping}
            placeholder="Напишите ответ…"
            className="min-h-[100px] resize-none"
            maxLength={50000}
          />

          <div className="mt-2 flex items-center justify-between">
            <span className="text-xs text-muted-foreground">{replyContent.length} / 50 000</span>
            <Button type="submit" size="sm" disabled={submitting || !replyContent.trim()}>
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Отправить
            </Button>
          </div>
        </form>
      ) : isLocked ? (
        <p className="mt-4 rounded-lg bg-muted/50 px-4 py-3 text-center text-sm text-muted-foreground">
          Тема закрыта для ответов
        </p>
      ) : (
        <p className="mt-4 rounded-lg bg-muted/50 px-4 py-3 text-center text-sm text-muted-foreground">
          <Link href="/login" className="text-primary hover:underline">
            Войдите
          </Link>
          , чтобы ответить
        </p>
      )}
    </div>
  )
}
