'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Check, Heart, MessageCircle, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { gramApi } from '@/lib/api/gram'
import { useAuthStore } from '@/store/auth.store'
import { CommentModal } from './CommentModal'
import type { GramPost } from '@/types/gram'

interface GramPostCardProps {
  post: GramPost
  externalLikeCount?: number
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'только что'
  if (m < 60) return `${m} мин.`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч.`
  const d = Math.floor(h / 24)
  if (d < 30) return `${d} дн.`
  return new Date(iso).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })
}

function renderContent(text: string) {
  const parts = text.split(/(#[\wа-яёА-ЯЁ]+)/g)
  return parts.map((part, i) => {
    if (part.startsWith('#')) {
      const tag = part.slice(1).toLowerCase()
      return (
        <Link key={i} href={`/gram/tags/${tag}`} className="text-primary hover:underline">
          {part}
        </Link>
      )
    }
    return <span key={i}>{part}</span>
  })
}

export function GramPostCard({ post, externalLikeCount }: GramPostCardProps) {
  const user = useAuthStore((s) => s.user)
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(post._count.likes)
  const [likeLoading, setLikeLoading] = useState(false)

  const [commentOpen, setCommentOpen] = useState(false)
  const [commentCount, setCommentCount] = useState(post._count.comments)

  const [shared, setShared] = useState(false)

  const displayCount = externalLikeCount ?? likeCount

  // ── Лайк ─────────────────────────────────────────────────────────────────

  const handleLike = async () => {
    if (!user || likeLoading) return
    setLikeLoading(true)
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount((c) => c + (wasLiked ? -1 : 1))
    try {
      const result = await gramApi.toggleLike(post.id)
      setLiked(result.liked)
      setLikeCount(result.count)
    } catch {
      setLiked(wasLiked)
      setLikeCount((c) => c + (wasLiked ? 1 : -1))
    } finally {
      setLikeLoading(false)
    }
  }

  // ── Поделиться ────────────────────────────────────────────────────────────

  const handleShare = async () => {
    const url = `${window.location.origin}/gram?post=${post.id}`

    if (typeof navigator.share === 'function') {
      try {
        await navigator.share({ url, title: `Пост от @${post.author.username}` })
      } catch {
        // Пользователь отменил — не показываем ошибку
      }
      return
    }

    // Fallback: копируем ссылку в буфер
    try {
      await navigator.clipboard.writeText(url)
    } catch {
      // clipboard недоступен — используем execCommand
      const el = document.createElement('input')
      el.value = url
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
    }
    setShared(true)
    setTimeout(() => setShared(false), 2000)
  }

  return (
    <>
      <article className="overflow-hidden rounded-xl border bg-card shadow-sm">
        {/* Шапка */}
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-bold uppercase text-primary">
            {post.author.avatar ? (
              <img
                src={post.author.avatar}
                alt={post.author.username}
                className="h-9 w-9 rounded-full object-cover"
              />
            ) : (
              post.author.username[0]
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold">@{post.author.username}</p>
            <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)} назад</p>
          </div>
        </div>

        {/* Контент */}
        <div className="px-4 pb-3 text-sm leading-relaxed">{renderContent(post.content)}</div>

        {/* Изображения */}
        {post.images.length > 0 && (
          <div
            className={cn(
              'grid gap-0.5',
              post.images.length === 1 && 'grid-cols-1',
              post.images.length === 2 && 'grid-cols-2',
              post.images.length >= 3 && 'grid-cols-2',
            )}
          >
            {post.images.slice(0, 4).map((src, i) => (
              <div
                key={i}
                className={cn(
                  'relative overflow-hidden bg-muted',
                  post.images.length === 1 ? 'aspect-[4/3]' : 'aspect-square',
                  post.images.length === 3 && i === 2 && 'col-span-2',
                )}
              >
                <Image
                  src={src}
                  alt={`Фото ${i + 1}`}
                  fill
                  sizes="(max-width: 640px) 100vw, 600px"
                  className="object-cover"
                />
                {i === 3 && post.images.length > 4 && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/50 text-xl font-bold text-white">
                    +{post.images.length - 4}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Теги */}
        {post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-4 pt-2">
            {post.tags.map((tag) => (
              <Link
                key={tag.id}
                href={`/gram/tags/${tag.slug}`}
                className="text-xs text-muted-foreground hover:text-primary"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}

        {/* Действия */}
        <div className="flex items-center gap-1 border-t px-2 py-1.5">
          {/* Лайк */}
          <button
            onClick={handleLike}
            disabled={!user}
            className={cn(
              'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors',
              liked
                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-950'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
              !user && 'cursor-default opacity-60',
            )}
            title={user ? (liked ? 'Убрать лайк' : 'Лайкнуть') : 'Войдите чтобы лайкнуть'}
          >
            <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
            <span>{displayCount}</span>
          </button>

          {/* Комментарии */}
          <button
            onClick={() => setCommentOpen(true)}
            className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <MessageCircle className="h-4 w-4" />
            <span>{commentCount}</span>
          </button>

          {/* Поделиться */}
          <button
            onClick={handleShare}
            className={cn(
              'ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors',
              shared
                ? 'text-green-600'
                : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            )}
            title="Поделиться"
          >
            {shared ? (
              <>
                <Check className="h-4 w-4" />
                <span className="text-xs">Скопировано</span>
              </>
            ) : (
              <Share2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </article>

      {/* Модалка комментариев */}
      <CommentModal
        postId={post.id}
        open={commentOpen}
        onClose={() => setCommentOpen(false)}
        initialCount={commentCount}
      />
    </>
  )
}
