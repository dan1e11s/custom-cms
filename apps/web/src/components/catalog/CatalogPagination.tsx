'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface CatalogPaginationProps {
  page: number
  totalPages: number
}

export function CatalogPagination({ page, totalPages }: CatalogPaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  if (totalPages <= 1) return null

  const goTo = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`/catalog?${params.toString()}`)
  }

  // Генерируем кнопки: первая, последняя + 2 соседних от текущей
  const pages: (number | '...')[] = []
  const range = (from: number, to: number) => {
    const arr: number[] = []
    for (let i = from; i <= to; i++) arr.push(i)
    return arr
  }

  if (totalPages <= 7) {
    pages.push(...range(1, totalPages))
  } else {
    pages.push(1)
    if (page > 3) pages.push('...')
    pages.push(...range(Math.max(2, page - 1), Math.min(totalPages - 1, page + 1)))
    if (page < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <div className="flex items-center justify-center gap-1">
      <Button variant="outline" size="icon" onClick={() => goTo(page - 1)} disabled={page <= 1}>
        <ChevronLeft className="h-4 w-4" />
      </Button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
            …
          </span>
        ) : (
          <Button
            key={p}
            variant={p === page ? 'default' : 'outline'}
            size="icon"
            onClick={() => goTo(p)}
          >
            {p}
          </Button>
        ),
      )}

      <Button
        variant="outline"
        size="icon"
        onClick={() => goTo(page + 1)}
        disabled={page >= totalPages}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  )
}
