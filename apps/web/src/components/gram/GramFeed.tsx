'use client'

import { useEffect, useRef, useCallback, useState } from 'react'
import { useInfiniteQuery, useQueryClient } from '@tanstack/react-query'
import { Loader2, Plus, Wifi, WifiOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { GramPostCard } from './GramPostCard'
import { CreatePostModal } from './CreatePostModal'
import { gramApi } from '@/lib/api/gram'
import { useGramSocket } from '@/lib/hooks/useGramSocket'
import { useAuthStore } from '@/store/auth.store'
import type { GramPost, GramFeedResponse } from '@/types/gram'

interface GramFeedProps {
  /** Первая страница загружена сервером (SSR) */
  initialPosts: GramPost[]
  initialNextCursor?: number
}

export function GramFeed({ initialPosts, initialNextCursor }: GramFeedProps) {
  const user = useAuthStore((s) => s.user)
  const queryClient = useQueryClient()
  const [createOpen, setCreateOpen] = useState(false)
  const [wsConnected, setWsConnected] = useState(false)
  // Счётчики лайков из WS — обновляются real-time
  const [liveLikes, setLiveLikes] = useState<Record<number, number>>({})
  const sentinelRef = useRef<HTMLDivElement>(null)

  // ── Infinite Query ────────────────────────────────────────────────────────

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery<
    GramFeedResponse,
    Error
  >({
    queryKey: ['gram-feed'],
    queryFn: ({ pageParam }) => gramApi.getFeed(pageParam as number | undefined),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => lastPage.nextCursor,
    initialData: {
      pages: [{ posts: initialPosts, nextCursor: initialNextCursor }],
      pageParams: [undefined],
    },
  })

  const allPosts = data?.pages.flatMap((p) => p.posts) ?? []

  // ── WebSocket ─────────────────────────────────────────────────────────────

  useGramSocket({
    onNewPost: useCallback(
      (post: GramPost) => {
        // Добавляем новый пост в начало кэша
        queryClient.setQueryData<typeof data>(['gram-feed'], (old) => {
          if (!old) return old
          return {
            ...old,
            pages: [
              { posts: [post, ...old.pages[0].posts], nextCursor: old.pages[0].nextCursor },
              ...old.pages.slice(1),
            ],
          }
        })
      },
      [queryClient],
    ),
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
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { rootMargin: '200px' },
    )

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // ── Обработчик создания поста ─────────────────────────────────────────────

  const handleCreated = useCallback(
    (post: GramPost) => {
      queryClient.setQueryData<typeof data>(['gram-feed'], (old) => {
        if (!old) return old
        return {
          ...old,
          pages: [
            { posts: [post, ...old.pages[0].posts], nextCursor: old.pages[0].nextCursor },
            ...old.pages.slice(1),
          ],
        }
      })
    },
    [queryClient],
  )

  // ── Рендер ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4">
      {/* Кнопка создания поста */}
      {user && (
        <button
          onClick={() => setCreateOpen(true)}
          className="flex w-full items-center gap-3 rounded-xl border bg-card px-4 py-3 text-left text-sm text-muted-foreground transition-colors hover:bg-muted/50"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary uppercase flex-shrink-0">
            {user.username[0]}
          </div>
          <span>Что нового, @{user.username}?</span>
          <Plus className="ml-auto h-4 w-4" />
        </button>
      )}

      {/* Посты */}
      {allPosts.length === 0 ? (
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
          {allPosts.map((post) => (
            <GramPostCard key={post.id} post={post} externalLikeCount={liveLikes[post.id]} />
          ))}

          {/* Sentinel для Intersection Observer */}
          <div ref={sentinelRef} className="h-4" />

          {isFetchingNextPage && (
            <div className="flex justify-center py-4">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          )}

          {!hasNextPage && allPosts.length > 0 && (
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
