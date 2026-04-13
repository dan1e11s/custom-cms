import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Eye, Lock, MessageSquare, Pin } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { ForumPostsList } from '@/components/forum/ForumPostsList'
import { forumServerApi } from '@/lib/api/forum'
import { SITE_NAME } from '@/lib/seo/config'
import type { ForumThread, ForumPostsResponse } from '@/types/forum'

export const dynamic = 'force-dynamic'

interface Props {
  params: { section: string; thread: string }
  searchParams: { page?: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const thread = await forumServerApi.getThreadBySlug(params.thread)
    return {
      title: `${thread.title} | Форум | ${SITE_NAME}`,
    }
  } catch {
    return { title: `Форум | ${SITE_NAME}` }
  }
}

export default async function ForumThreadPage({ params, searchParams }: Props) {
  const page = Number(searchParams.page ?? 1)
  const limit = 20

  let thread: ForumThread
  let postsData: ForumPostsResponse = { items: [], total: 0, page: 1, limit, pages: 0 }

  try {
    thread = await forumServerApi.getThreadBySlug(params.thread)
  } catch {
    notFound()
  }

  try {
    postsData = await forumServerApi.getPosts(params.thread, { page, limit })
  } catch {
    // показываем что есть
  }

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-3xl">
        {/* Breadcrumbs */}
        <nav className="mb-4 flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          <Link href="/forum" className="hover:text-foreground">
            Форум
          </Link>
          <span>/</span>
          <Link href={`/forum/${params.section}`} className="hover:text-foreground">
            {thread.section.title}
          </Link>
          <span>/</span>
          <span className="line-clamp-1 font-medium text-foreground">{thread.title}</span>
        </nav>

        {/* Заголовок темы */}
        <div className="mb-6 rounded-xl border bg-card p-5 shadow-sm">
          <div className="flex flex-wrap items-start gap-2">
            {thread.isPinned && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                title="Закреплена"
              >
                <Pin className="h-3 w-3" />
                Закреплена
              </span>
            )}
            {thread.isLocked && (
              <span
                className="inline-flex items-center gap-1 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground"
                title="Закрыта"
              >
                <Lock className="h-3 w-3" />
                Закрыта
              </span>
            )}
          </div>

          <h1 className="mt-2 text-xl font-bold leading-snug">{thread.title}</h1>

          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
            <span>
              Автор: <span className="font-medium text-foreground">@{thread.author.username}</span>
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-3.5 w-3.5" />
              {Math.max(0, thread._count.posts - 1)}{' '}
              {pluralize(Math.max(0, thread._count.posts - 1), ['ответ', 'ответа', 'ответов'])}
            </span>
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {thread.views} просмотров
            </span>
          </div>
        </div>

        {/* Пагинация сверху */}
        {postsData.pages > 1 && (
          <ThreadPagination
            section={params.section}
            thread={params.thread}
            page={page}
            totalPages={postsData.pages}
          />
        )}

        {/* Сообщения + форма ответа (клиентский компонент с WS) */}
        <ForumPostsList
          threadId={thread.id}
          threadSlug={params.thread}
          isLocked={thread.isLocked}
          initialData={postsData}
          page={page}
        />

        {/* Пагинация снизу */}
        {postsData.pages > 1 && (
          <div className="mt-6">
            <ThreadPagination
              section={params.section}
              thread={params.thread}
              page={page}
              totalPages={postsData.pages}
            />
          </div>
        )}
      </div>
    </Container>
  )
}

// ── Компонент пагинации ───────────────────────────────────────────────────────

function ThreadPagination({
  section,
  thread,
  page,
  totalPages,
}: {
  section: string
  thread: string
  page: number
  totalPages: number
}) {
  return (
    <div className="mb-4 flex items-center justify-center gap-1">
      <Link
        href={`/forum/${section}/${thread}?page=${page - 1}`}
        aria-disabled={page <= 1}
        className={page <= 1 ? 'pointer-events-none opacity-40' : ''}
      >
        <Button variant="outline" size="icon" tabIndex={page <= 1 ? -1 : 0}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
      </Link>

      <span className="px-3 text-sm text-muted-foreground">
        {page} / {totalPages}
      </span>

      <Link
        href={`/forum/${section}/${thread}?page=${page + 1}`}
        aria-disabled={page >= totalPages}
        className={page >= totalPages ? 'pointer-events-none opacity-40' : ''}
      >
        <Button variant="outline" size="icon" tabIndex={page >= totalPages ? -1 : 0}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </Link>
    </div>
  )
}

function pluralize(n: number, forms: [string, string, string]): string {
  const mod10 = n % 10
  const mod100 = n % 100
  if (mod100 >= 11 && mod100 <= 14) return forms[2]
  if (mod10 === 1) return forms[0]
  if (mod10 >= 2 && mod10 <= 4) return forms[1]
  return forms[2]
}
