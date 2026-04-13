import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Button } from '@/components/ui/button'
import { ThreadRow } from '@/components/forum/ThreadRow'
import { NewThreadButton } from '@/components/forum/NewThreadButton'
import { forumServerApi } from '@/lib/api/forum'
import { SITE_NAME } from '@/lib/seo/config'
import type { ForumSection, ForumThreadsResponse } from '@/types/forum'

export const dynamic = 'force-dynamic'

interface Props {
  params: { section: string }
  searchParams: { page?: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const section = await forumServerApi.getSectionBySlug(params.section)
    return {
      title: `${section.title} | Форум | ${SITE_NAME}`,
      description: section.description ?? `Темы раздела ${section.title}`,
    }
  } catch {
    return { title: `Форум | ${SITE_NAME}` }
  }
}

export default async function ForumSectionPage({ params, searchParams }: Props) {
  const page = Number(searchParams.page ?? 1)
  const limit = 20

  let section: ForumSection
  let threadsData: ForumThreadsResponse = { items: [], total: 0, page: 1, limit, pages: 0 }

  try {
    section = await forumServerApi.getSectionBySlug(params.section)
  } catch {
    notFound()
  }

  try {
    threadsData = await forumServerApi.getThreads(params.section, { page, limit })
  } catch {
    // показываем пустой список
  }

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-4xl">
        {/* Breadcrumbs */}
        <nav className="mb-4 flex items-center gap-1 text-sm text-muted-foreground">
          <Link href="/forum" className="hover:text-foreground">
            Форум
          </Link>
          <span>/</span>
          <span className="font-medium text-foreground">{section.title}</span>
        </nav>

        {/* Заголовок + кнопка */}
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">{section.title}</h1>
            {section.description && (
              <p className="mt-1 text-sm text-muted-foreground">{section.description}</p>
            )}
          </div>
          {/* Клиентский компонент: проверяет авторизацию и показывает кнопку */}
          <NewThreadButton sectionId={section.id} sectionSlug={params.section} />
        </div>

        {/* Таблица тем */}
        {threadsData.items.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="font-medium">Тем пока нет</p>
            <p className="mt-1 text-sm">Будьте первым — создайте тему!</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40 text-xs uppercase text-muted-foreground">
                  <th className="py-2.5 pl-4 pr-2 text-left font-medium">Тема</th>
                  <th className="hidden py-2.5 px-2 text-center font-medium sm:table-cell">
                    Ответы
                  </th>
                  <th className="hidden py-2.5 px-2 text-center font-medium lg:table-cell">
                    Просмотры
                  </th>
                  <th className="hidden py-2.5 pr-4 text-right font-medium md:table-cell">
                    Активность
                  </th>
                </tr>
              </thead>
              <tbody>
                {threadsData.items.map((thread) => (
                  <ThreadRow key={thread.id} thread={thread} sectionSlug={params.section} />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Пагинация */}
        {threadsData.pages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-1">
            <Link
              href={`/forum/${params.section}?page=${page - 1}`}
              aria-disabled={page <= 1}
              className={page <= 1 ? 'pointer-events-none opacity-40' : ''}
            >
              <Button variant="outline" size="icon" tabIndex={page <= 1 ? -1 : 0}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
            </Link>

            <span className="px-3 text-sm text-muted-foreground">
              {page} / {threadsData.pages}
            </span>

            <Link
              href={`/forum/${params.section}?page=${page + 1}`}
              aria-disabled={page >= threadsData.pages}
              className={page >= threadsData.pages ? 'pointer-events-none opacity-40' : ''}
            >
              <Button variant="outline" size="icon" tabIndex={page >= threadsData.pages ? -1 : 0}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        )}
      </div>
    </Container>
  )
}
