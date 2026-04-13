import Link from 'next/link'
import { MessageSquare } from 'lucide-react'
import type { ForumSection } from '@/types/forum'

interface ForumSectionCardProps {
  section: ForumSection
}

export function ForumSectionCard({ section }: ForumSectionCardProps) {
  return (
    <Link
      href={`/forum/${section.slug}`}
      className="group block rounded-xl border bg-card p-5 shadow-sm transition-colors hover:border-primary/40 hover:bg-muted/30"
    >
      <div className="flex items-start gap-4">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <MessageSquare className="h-5 w-5" />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-semibold leading-tight group-hover:text-primary">{section.title}</h2>
          {section.description && (
            <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{section.description}</p>
          )}
        </div>

        <div className="flex-shrink-0 text-right">
          <p className="text-lg font-bold">{section._count.threads}</p>
          <p className="text-xs text-muted-foreground">
            {pluralize(section._count.threads, ['тема', 'темы', 'тем'])}
          </p>
        </div>
      </div>
    </Link>
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
