'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Loader2, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GramPostCard } from './GramPostCard'
import { CreatePostModal } from './CreatePostModal'
import { gramApi } from '@/lib/api/gram'
import { useGramSocket } from '@/lib/hooks/useGramSocket'
import { useAuthStore } from '@/store/auth.store'
import type { GramPost } from '@/types/gram'

interface GramFeedProps {
  /** Первая страница загружена сервером (SSR) */
  initialPosts: GramPost[]
  initialNextCursor?: number
}

export function GramFeed({ initialPosts, initialNextCursor }: GramFeedProps) {
  const user = useAuthStore((s) => s.user)

  // ── Локальное состояние ───────────────────────────────────────────────────
  // Используем useState(initialPosts), а не React Query initialData.
  // React Query с initialData игнорирует его когда в кэше уже есть данные
  // (повторный визит страницы), что вызывает hydration mismatch.
  const [posts, setPosts] = useState<GramPost[]>(initialPosts)
  const [cursor, setCursor] = useState<number | undefined>(initialNextCursor)
  const [hasMore, setHasMore] = useState(!!initialNextCursor)
  const [isFetchingMore, setIsFetchingMore] = useState(false)
  const [createOpen, setCreateOpen] = useState(false)

  // Счётчики лайков из WS — обновляются real-time
  const [liveLikes, setLiveLikes] = useState<Record<number, number>>({})

  const sentinelRef = useRef<HTMLDivElement>(null)

  // ── Загрузка следующей порции ─────────────────────────────────────────────

  const fetchMore = useCallback(async () => {
    if (!hasMore || isFetchingMore) return
    setIsFetchingMore(true)
    try {
      const data = await gramApi.getFeed(cursor)
      setPosts((prev) => [...prev, ...data.posts])
      setCursor(data.nextCursor)
      setHasMore(!!data.nextCursor)
    } catch {
      // ignore
    } finally {
      setIsFetchingMore(false)
    }
  }, [cursor, hasMore, isFetchingMore])

  // ── WebSocket ─────────────────────────────────────────────────────────────

  useGramSocket({
    onNewPost: useCallback((post: GramPost) => {
      // Добавляем в начало, дедуп по id
      setPosts((prev) => (prev.some((p) => p.id === post.id) ? prev : [post, ...prev]))
    }, []),
    onLikeUpdate: useCallback(({ postId, count }: { postId: number; count: number }) => {
      setLiveLikes((prev) => ({ ...prev, [postId]: count }))
    }, []),
  })

  // ── Intersection Observer для auto-load ───────────────────────────────────

  useEffect(() => {
    const sentinel = sentinelRef.current
    if (!sentinel) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchMore()
      },
      { rootMargin: '200px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [fetchMore])

  // ── Обработчик создания поста ─────────────────────────────────────────────

  const handleCreated = useCallback((post: GramPost) => {
    setPosts((prev) => [post, ...prev])
  }, [])

  // ── Рендер ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Кнопка создания поста */}
      {user && (
        <button
          onClick={() => setCreateOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50"
        >
          <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold uppercase text-primary">
            {user.username[0]}
          </div>
          <span>Что нового, @{user.username}?</span>
          <Plus className="ml-auto h-4 w-4" />
        </button>
      )}

      {/* Посты */}
      {posts.length === 0 ? (
        <div className="py-20 text-center text-muted-foreground">
          <p className="font-medium">Постов пока нет</p>
          {user && (
            <Button className="mt-4" onClick={() => setCreateOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Написать первый пост
            </Button>
          )}
        </div>
      ) : (
        <>
          {posts.map((post) => (
            <GramPostCard key={post.id} post={post} externalLikeCount={liveLikes[post.id]} />
          ))}

          {/* Sentinel для Intersection Observer */}
          <div ref={sentinelRef} className="h-4" />

          {isFetchingMore && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!hasMore && posts.length > 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">Все посты загружены</p>
          )}
        </>
      )}

      <CreatePostModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  )
}
