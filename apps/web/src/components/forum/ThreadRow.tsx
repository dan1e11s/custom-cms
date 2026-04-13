import Link from 'next/link'
import { Eye, MessageSquare, Pin, Lock } from 'lucide-react'
import type { ForumThread } from '@/types/forum'

interface ThreadRowProps {
  thread: ForumThread
  sectionSlug: string
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
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

export function ThreadRow({ thread, sectionSlug }: ThreadRowProps) {
  return (
    <tr className="border-b transition-colors last:border-0 hover:bg-muted/30">
      {/* Тема */}
      <td className="py-3 pl-4 pr-2">
        <div className="flex items-start gap-2">
          <div className="flex flex-shrink-0 flex-col gap-0.5 pt-0.5">
            {thread.isPinned && (
              <Pin className="h-3.5 w-3.5 text-primary" aria-label="Закреплена" />
            )}
            {thread.isLocked && (
              <Lock className="h-3.5 w-3.5 text-muted-foreground" aria-label="Закрыта" />
            )}
          </div>
          <div className="min-w-0">
            <Link
              href={`/forum/${sectionSlug}/${thread.slug}`}
              className="line-clamp-2 font-medium leading-snug hover:text-primary"
            >
              {thread.title}
            </Link>
            <p className="mt-0.5 text-xs text-muted-foreground">
              @{thread.author.username} · {timeAgo(thread.createdAt)}
            </p>
          </div>
        </div>
      </td>

      {/* Ответы */}
      <td className="hidden px-2 py-3 text-center text-sm text-muted-foreground sm:table-cell">
        <div className="flex items-center justify-center gap-1">
          <MessageSquare className="h-3.5 w-3.5" />
          <span>{Math.max(0, thread._count.posts - 1)}</span>
        </div>
      </td>

      {/* Просмотры */}
      <td className="hidden px-2 py-3 text-center text-sm text-muted-foreground lg:table-cell">
        <div className="flex items-center justify-center gap-1">
          <Eye className="h-3.5 w-3.5" />
          <span>{thread.views}</span>
        </div>
      </td>

      {/* Последний пост */}
      <td className="hidden py-3 pr-4 text-right text-xs text-muted-foreground md:table-cell">
        {timeAgo(thread.lastPostAt)}
      </td>
    </tr>
  )
}
