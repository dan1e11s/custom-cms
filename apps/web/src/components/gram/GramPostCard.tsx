'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, MessageCircle, Share2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { gramApi } from '@/lib/api/gram'
import { useAuthStore } from '@/store/auth.store'
import type { GramPost } from '@/types/gram'

interface GramPostCardProps {
  post: GramPost
  /** Обновлённый счётчик лайков из WS (приоритет над внутренним) */
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

/** Оборачивает #хэштеги в ссылки */
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

  // Синхронизируем счётчик из WS
  const displayCount = externalLikeCount ?? likeCount

  const handleLike = async () => {
    if (!user || likeLoading) return
    setLikeLoading(true)

    // Оптимистичное обновление
    const wasLiked = liked
    setLiked(!wasLiked)
    setLikeCount((c) => c + (wasLiked ? -1 : 1))

    try {
      const result = await gramApi.toggleLike(post.id)
      setLiked(result.liked)
      setLikeCount(result.count)
    } catch {
      // Откат при ошибке
      setLiked(wasLiked)
      setLikeCount((c) => c + (wasLiked ? 1 : -1))
    } finally {
      setLikeLoading(false)
    }
  }

  const handleShare = () => {
    navigator.share?.({
      url: `${window.location.origin}/gram?post=${post.id}`,
      title: `Пост от @${post.author.username}`,
    })
  }

  return (
    <article className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Шапка */}
      <div className="flex items-center gap-3 px-4 py-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary uppercase flex-shrink-0">
          {post.author.username[0]}
        </div>
        <div className="flex-1 min-w-0">
          <Link
            href={`/gram/users/${post.author.id}`}
            className="text-sm font-semibold hover:text-primary"
          >
            @{post.author.username}
          </Link>
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
                // Третье фото занимает полную ширину если изображений 3
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
              {/* Оверлей "+N" для 4+ изображений */}
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
        <button
          onClick={handleLike}
          disabled={!user}
          className={cn(
            'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm transition-colors',
            liked
              ? 'text-red-500 hover:bg-red-50'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground',
            !user && 'cursor-default opacity-60',
          )}
          title={user ? (liked ? 'Убрать лайк' : 'Лайкнуть') : 'Войдите чтобы лайкнуть'}
        >
          <Heart className={cn('h-4 w-4', liked && 'fill-current')} />
          <span>{displayCount}</span>
        </button>

        <Link
          href={`/gram?post=${post.id}`}
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <MessageCircle className="h-4 w-4" />
          <span>{post._count.comments}</span>
        </Link>

        <button
          onClick={handleShare}
          className="ml-auto flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <Share2 className="h-4 w-4" />
        </button>
      </div>
    </article>
  )
}
