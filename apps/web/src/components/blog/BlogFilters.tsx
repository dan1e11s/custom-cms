'use client'

import { useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { X, Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import type { BlogTag, BlogCategory } from '@/types/blog'

interface BlogFiltersProps {
  tags: BlogTag[]
  categories: BlogCategory[]
}

export function BlogFilters({ tags, categories }: BlogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const activeTag = searchParams.get('tag') ?? ''
  const activeCategory = searchParams.get('categorySlug') ?? ''
  const search = searchParams.get('search') ?? ''

  const push = useCallback(
    (updates: Record<string, string | undefined>) => {
      const params = new URLSearchParams(searchParams.toString())
      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v)
        else params.delete(k)
      })
      params.delete('page')
      router.push(`/blog?${params.toString()}`)
    },
    [router, searchParams],
  )

  const hasFilters = activeTag || activeCategory || search

  return (
    <div className="space-y-4">
      {/* Поиск + сброс */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            defaultValue={search}
            placeholder="Поиск статей..."
            className="pl-9"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                push({ search: (e.target as HTMLInputElement).value || undefined })
              }
            }}
            onBlur={(e) => {
              if (e.target.value !== search) {
                push({ search: e.target.value || undefined })
              }
            }}
          />
        </div>
        {hasFilters && (
          <button
            onClick={() => router.push('/blog')}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
            Сбросить
          </button>
        )}
      </div>

      {/* Категории */}
      {categories.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => push({ categorySlug: undefined })}
            className={cn(
              'rounded-full border px-3 py-1 text-sm transition-colors',
              !activeCategory
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-border hover:border-primary/50 hover:bg-muted',
            )}
          >
            Все
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() =>
                push({ categorySlug: activeCategory === cat.slug ? undefined : cat.slug })
              }
              className={cn(
                'rounded-full border px-3 py-1 text-sm transition-colors',
                activeCategory === cat.slug
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border hover:border-primary/50 hover:bg-muted',
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Теги */}
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => push({ tag: activeTag === tag.slug ? undefined : tag.slug })}
              className={cn(
                'rounded-full border px-2.5 py-0.5 text-xs transition-colors',
                activeTag === tag.slug
                  ? 'border-accent bg-accent text-accent-foreground'
                  : 'border-border text-muted-foreground hover:border-accent/50 hover:text-foreground',
              )}
            >
              #{tag.name}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
