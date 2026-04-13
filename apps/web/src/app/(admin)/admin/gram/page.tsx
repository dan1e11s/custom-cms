'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { Heart, ImageIcon, Loader2, MessageCircle, Search, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { gramApi } from '@/lib/api/gram'
import type { GramPost } from '@/types/gram'

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminGramPage() {
  const [posts, setPosts] = useState<GramPost[]>([])
  const [nextCursor, setNextCursor] = useState<number | undefined>()
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [search, setSearch] = useState('')

  // Удаление
  const [deleteTarget, setDeleteTarget] = useState<GramPost | null>(null)
  const [deleting, setDeleting] = useState(false)

  // Просмотр изображений
  const [lightbox, setLightbox] = useState<{ images: string[]; index: number } | null>(null)

  const sentinelRef = useRef<HTMLDivElement>(null)

  // ── Загрузка ───────────────────────────────────────────────────────────────

  const loadInitial = useCallback(async () => {
    setLoading(true)
    try {
      const data = await gramApi.getFeed(undefined, 30)
      setPosts(data.posts)
      setNextCursor(data.nextCursor)
    } catch {
      setPosts([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadInitial()
  }, [loadInitial])

  const loadMore = async () => {
    if (!nextCursor || loadingMore) return
    setLoadingMore(true)
    try {
      const data = await gramApi.getFeed(nextCursor, 30)
      setPosts((prev) => [...prev, ...data.posts])
      setNextCursor(data.nextCursor)
    } catch {
      // ignore
    } finally {
      setLoadingMore(false)
    }
  }

  // ── Intersection Observer для "Загрузить ещё" ──────────────────────────────

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !loadingMore) {
          loadMore()
        }
      },
      { rootMargin: '200px' },
    )
    observer.observe(sentinel)
    return () => observer.disconnect()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextCursor, loadingMore])

  // ── Удаление ──────────────────────────────────────────────────────────────

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await gramApi.deletePost(deleteTarget.id)
      setPosts((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      setDeleteTarget(null)
    } catch {
      // ignore
    } finally {
      setDeleting(false)
    }
  }

  // ── Клиентский фильтр ─────────────────────────────────────────────────────

  const filtered = search.trim()
    ? posts.filter(
        (p) =>
          p.content.toLowerCase().includes(search.toLowerCase()) ||
          p.author.username.toLowerCase().includes(search.toLowerCase()) ||
          p.tags.some((t) => t.name.toLowerCase().includes(search.toLowerCase())),
      )
    : posts

  // ── Рендер ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Шапка */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Нельзя Грам</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Модерация постов сообщества</p>
        </div>
        <div className="text-sm text-muted-foreground">
          {loading ? '…' : `${posts.length} постов загружено`}
        </div>
      </div>

      {/* Поиск */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Автор, текст, #тег…"
          className="pl-9 pr-8"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Таблица постов */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">
          {search ? 'Ничего не найдено' : 'Постов пока нет'}
        </div>
      ) : (
        <>
          <div className="overflow-hidden rounded-lg border bg-background">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-xs uppercase text-muted-foreground">
                  <th className="px-4 py-3 text-left font-medium">Пост</th>
                  <th className="hidden px-3 py-3 text-left font-medium sm:table-cell">Автор</th>
                  <th className="hidden px-3 py-3 text-center font-medium md:table-cell">Фото</th>
                  <th className="hidden px-3 py-3 text-center font-medium lg:table-cell">
                    Статистика
                  </th>
                  <th className="px-4 py-3 text-right font-medium">Дата</th>
                  <th className="w-10 px-2 py-3" />
                </tr>
              </thead>
              <tbody>
                {filtered.map((post) => (
                  <PostRow
                    key={post.id}
                    post={post}
                    onDelete={() => setDeleteTarget(post)}
                    onImageClick={(images, index) => setLightbox({ images, index })}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Sentinel для автоподгрузки */}
          <div ref={sentinelRef} className="h-4" />

          {loadingMore && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!nextCursor && posts.length > 0 && (
            <p className="text-center text-xs text-muted-foreground">Все посты загружены</p>
          )}
        </>
      )}

      {/* ── Диалог подтверждения удаления ── */}
      <Dialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Удалить пост?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Пост от{' '}
            <span className="font-medium text-foreground">@{deleteTarget?.author.username}</span>{' '}
            будет удалён без возможности восстановления.
          </p>
          {deleteTarget && (
            <p className="rounded-md bg-muted/50 px-3 py-2 text-xs italic text-muted-foreground line-clamp-3">
              {deleteTarget.content}
            </p>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Лайтбокс изображений ── */}
      {lightbox && (
        <Lightbox
          images={lightbox.images}
          startIndex={lightbox.index}
          onClose={() => setLightbox(null)}
        />
      )}
    </div>
  )
}

// ── Строка поста ──────────────────────────────────────────────────────────────

interface PostRowProps {
  post: GramPost
  onDelete: () => void
  onImageClick: (images: string[], index: number) => void
}

function PostRow({ post, onDelete, onImageClick }: PostRowProps) {
  return (
    <tr className="border-b last:border-0 transition-colors hover:bg-muted/20">
      {/* Контент */}
      <td className="px-4 py-3">
        <p className="line-clamp-2 max-w-xs text-sm leading-relaxed">
          {post.content || <span className="italic text-muted-foreground">Без текста</span>}
        </p>
        {post.tags.length > 0 && (
          <div className="mt-1 flex flex-wrap gap-1">
            {post.tags.slice(0, 4).map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-muted px-1.5 py-px text-xs text-muted-foreground"
              >
                #{tag.name}
              </span>
            ))}
            {post.tags.length > 4 && (
              <span className="text-xs text-muted-foreground">+{post.tags.length - 4}</span>
            )}
          </div>
        )}
      </td>

      {/* Автор */}
      <td className="hidden px-3 py-3 sm:table-cell">
        <span className="font-medium">@{post.author.username}</span>
      </td>

      {/* Фото */}
      <td className="hidden px-3 py-3 md:table-cell">
        {post.images.length > 0 ? (
          <button
            onClick={() => onImageClick(post.images, 0)}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
          >
            <div className="relative h-10 w-10 overflow-hidden rounded border">
              <Image src={post.images[0]} alt="" fill sizes="40px" className="object-cover" />
            </div>
            {post.images.length > 1 && <span className="ml-1">+{post.images.length - 1}</span>}
          </button>
        ) : (
          <span className="text-muted-foreground/40">
            <ImageIcon className="h-4 w-4" />
          </span>
        )}
      </td>

      {/* Статистика */}
      <td className="hidden px-3 py-3 lg:table-cell">
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Heart className="h-3.5 w-3.5" />
            {post._count.likes}
          </span>
          <span className="flex items-center gap-1">
            <MessageCircle className="h-3.5 w-3.5" />
            {post._count.comments}
          </span>
        </div>
      </td>

      {/* Дата */}
      <td className="px-4 py-3 text-right text-xs text-muted-foreground">
        {formatDate(post.createdAt)}
      </td>

      {/* Действия */}
      <td className="px-2 py-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 hover:text-destructive"
          title="Удалить пост"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </td>
    </tr>
  )
}

// ── Лайтбокс ─────────────────────────────────────────────────────────────────

interface LightboxProps {
  images: string[]
  startIndex: number
  onClose: () => void
}

function Lightbox({ images, startIndex, onClose }: LightboxProps) {
  const [index, setIndex] = useState(startIndex)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length)
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + images.length) % images.length)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [images.length, onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85"
      onClick={onClose}
    >
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full bg-black/50 p-1.5 text-white hover:bg-black/70"
      >
        <X className="h-5 w-5" />
      </button>

      <div
        className="relative max-h-[85vh] max-w-3xl w-full mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <Image
          src={images[index]}
          alt={`Фото ${index + 1} из ${images.length}`}
          width={900}
          height={700}
          className="mx-auto max-h-[85vh] w-auto rounded-lg object-contain"
        />

        {images.length > 1 && (
          <>
            <button
              onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/70"
            >
              ‹
            </button>
            <button
              onClick={() => setIndex((i) => (i + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-black/50 px-3 py-2 text-white hover:bg-black/70"
            >
              ›
            </button>
            <p className="mt-2 text-center text-sm text-white/70">
              {index + 1} / {images.length}
            </p>
          </>
        )}
      </div>
    </div>
  )
}
