'use client'

import { useEffect, useRef, useState } from 'react'
import { CornerDownRight, Loader2, Send } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { gramApi } from '@/lib/api/gram'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'
import type { GramComment } from '@/types/gram'

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'только что'
  if (m < 60) return `${m} мин.`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч.`
  return `${Math.floor(h / 24)} дн.`
}

// ── Одиночный комментарий ─────────────────────────────────────────────────────

function CommentItem({
  comment,
  postId,
  onReplyAdded,
  depth = 0,
}: {
  comment: GramComment
  postId: number
  onReplyAdded: (parentId: number, reply: GramComment) => void
  depth?: number
}) {
  const user = useAuthStore((s) => s.user)
  const [replyOpen, setReplyOpen] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const handleReply = async () => {
    if (!replyContent.trim()) return
    setSubmitting(true)
    try {
      const reply = await gramApi.addComment(postId, {
        content: replyContent.trim(),
        parentId: comment.id,
      })
      onReplyAdded(comment.id, reply)
      setReplyContent('')
      setReplyOpen(false)
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  useEffect(() => {
    if (replyOpen) inputRef.current?.focus()
  }, [replyOpen])

  if (comment.isDeleted) {
    return (
      <div
        className={cn(
          'py-2 text-xs text-muted-foreground italic',
          depth > 0 && 'ml-6 border-l pl-3',
        )}
      >
        [удалено]
      </div>
    )
  }

  return (
    <div className={cn('group', depth > 0 && 'ml-6 border-l border-border pl-3')}>
      <div className="flex gap-2.5 py-2.5">
        {/* Аватар */}
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold uppercase text-primary">
          {comment.author.username[0]}
        </div>

        {/* Тело */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-sm font-semibold">@{comment.author.username}</span>
            <span className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</span>
          </div>
          <p className="mt-0.5 text-sm leading-snug">{comment.content}</p>

          {/* Ответить */}
          {user && depth === 0 && (
            <button
              onClick={() => setReplyOpen((v) => !v)}
              className="mt-1 flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <CornerDownRight className="h-3 w-3" />
              Ответить
            </button>
          )}

          {/* Форма ответа */}
          {replyOpen && (
            <div className="mt-2 flex gap-2">
              <Textarea
                ref={inputRef}
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder={`Ответ для @${comment.author.username}...`}
                rows={2}
                className="text-sm resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleReply()
                }}
              />
              <div className="flex flex-col gap-1">
                <Button
                  size="icon"
                  className="h-8 w-8"
                  onClick={handleReply}
                  disabled={submitting || !replyContent.trim()}
                >
                  {submitting ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Send className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => setReplyOpen(false)}
                >
                  ✕
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Вложенные ответы */}
      {comment.replies?.map((reply) => (
        <CommentItem
          key={reply.id}
          comment={reply}
          postId={postId}
          onReplyAdded={onReplyAdded}
          depth={depth + 1}
        />
      ))}
    </div>
  )
}

// ── Главный компонент ─────────────────────────────────────────────────────────

interface CommentModalProps {
  postId: number
  open: boolean
  onClose: () => void
  initialCount: number
}

export function CommentModal({ postId, open, onClose, initialCount }: CommentModalProps) {
  const user = useAuthStore((s) => s.user)
  const [comments, setComments] = useState<GramComment[]>([])
  const [loading, setLoading] = useState(false)
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const listRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    setLoading(true)
    gramApi
      .getComments(postId)
      .then(setComments)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [open, postId])

  const handleSubmit = async () => {
    if (!content.trim()) return
    setSubmitting(true)
    try {
      const comment = await gramApi.addComment(postId, { content: content.trim() })
      setComments((prev) => [...prev, comment])
      setContent('')
      // Скроллим к новому комментарию
      setTimeout(() => {
        listRef.current?.scrollTo({ top: listRef.current.scrollHeight, behavior: 'smooth' })
      }, 50)
    } catch {
      /* ignore */
    } finally {
      setSubmitting(false)
    }
  }

  const handleReplyAdded = (parentId: number, reply: GramComment) => {
    setComments((prev) =>
      prev.map((c) => (c.id === parentId ? { ...c, replies: [...(c.replies ?? []), reply] } : c)),
    )
  }

  const totalCount = comments.reduce((acc, c) => acc + 1 + (c.replies?.length ?? 0), 0)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="flex max-h-[85vh] flex-col gap-0 p-0 sm:max-w-lg">
        <DialogHeader className="border-b px-5 py-4">
          <DialogTitle>Комментарии {open && !loading && `(${totalCount})`}</DialogTitle>
        </DialogHeader>

        {/* Список */}
        <div ref={listRef} className="flex-1 overflow-y-auto px-5 py-2">
          {loading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : comments.length === 0 ? (
            <p className="py-10 text-center text-sm text-muted-foreground">
              Комментариев пока нет. Будьте первым!
            </p>
          ) : (
            <div className="divide-y divide-border/50">
              {comments.map((c) => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  postId={postId}
                  onReplyAdded={handleReplyAdded}
                />
              ))}
            </div>
          )}
        </div>

        {/* Форма добавления */}
        {user ? (
          <div className="border-t p-4 flex gap-2 items-end">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Напишите комментарий..."
              rows={2}
              className="text-sm resize-none"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSubmit()
              }}
            />
            <Button
              size="icon"
              onClick={handleSubmit}
              disabled={submitting || !content.trim()}
              className="shrink-0 h-10 w-10"
            >
              {submitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </div>
        ) : (
          <p className="border-t px-5 py-3 text-center text-sm text-muted-foreground">
            <a href="/login" className="text-primary hover:underline">
              Войдите
            </a>
            , чтобы оставить комментарий
          </p>
        )}
      </DialogContent>
    </Dialog>
  )
}
