'use client'

import { useCallback, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, SlidersHorizontal } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const SORT_OPTIONS = [
  { value: 'createdAt_desc', label: 'Новые' },
  { value: 'createdAt_asc', label: 'Старые' },
  { value: 'price_asc', label: 'Дешевле' },
  { value: 'price_desc', label: 'Дороже' },
  { value: 'name_asc', label: 'А → Я' },
]

export function CatalogFilters() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(searchParams.get('search') ?? '')
  const [minPrice, setMinPrice] = useState(searchParams.get('minPrice') ?? '')
  const [maxPrice, setMaxPrice] = useState(searchParams.get('maxPrice') ?? '')
  const [inStock, setInStock] = useState(searchParams.get('inStock') === 'true')
  const [sortValue, setSortValue] = useState(
    `${searchParams.get('sortBy') ?? 'createdAt'}_${searchParams.get('sortOrder') ?? 'desc'}`,
  )
  const [showFilters, setShowFilters] = useState(false)

  const pushFilters = useCallback(
    (overrides: Record<string, string | undefined> = {}) => {
      const params = new URLSearchParams(searchParams.toString())

      const updates: Record<string, string | undefined> = {
        search: search || undefined,
        minPrice: minPrice || undefined,
        maxPrice: maxPrice || undefined,
        inStock: inStock ? 'true' : undefined,
        sortBy: sortValue.split('_')[0],
        sortOrder: sortValue.split('_')[1],
        page: '1', // сброс пагинации при изменении фильтров
        ...overrides,
      }

      Object.entries(updates).forEach(([k, v]) => {
        if (v) params.set(k, v)
        else params.delete(k)
      })

      router.push(`/catalog?${params.toString()}`)
    },
    [router, searchParams, search, minPrice, maxPrice, inStock, sortValue],
  )

  // Дебаунс поиска
  useEffect(() => {
    const timer = setTimeout(() => {
      if (search !== (searchParams.get('search') ?? '')) {
        pushFilters({ search: search || undefined })
      }
    }, 500)
    return () => clearTimeout(timer)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search])

  const handleSortChange = (value: string) => {
    setSortValue(value)
    const [sortBy, sortOrder] = value.split('_')
    pushFilters({ sortBy, sortOrder })
  }

  const handlePriceSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    pushFilters()
  }

  const handleInStockChange = (checked: boolean) => {
    setInStock(checked)
    pushFilters({ inStock: checked ? 'true' : undefined })
  }

  const hasActiveFilters =
    !!search || !!minPrice || !!maxPrice || inStock || sortValue !== 'createdAt_desc'

  const resetFilters = () => {
    setSearch('')
    setMinPrice('')
    setMaxPrice('')
    setInStock(false)
    setSortValue('createdAt_desc')
    router.push('/catalog')
  }

  return (
    <div className="space-y-3">
      {/* Строка поиска + сортировка */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative min-w-[200px] flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск товаров..."
            className="pl-9"
          />
        </div>

        <select
          value={sortValue}
          onChange={(e) => handleSortChange(e.target.value)}
          className="h-10 rounded-md border bg-background px-3 text-sm"
        >
          {SORT_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters((v) => !v)}
          className={cn(showFilters && 'bg-muted')}
        >
          <SlidersHorizontal className="mr-1.5 h-4 w-4" />
          Фильтры
          {hasActiveFilters && (
            <span className="ml-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
              !
            </span>
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Сбросить
          </Button>
        )}
      </div>

      {/* Панель расширенных фильтров */}
      {showFilters && (
        <form
          onSubmit={handlePriceSubmit}
          className="flex flex-wrap items-end gap-4 rounded-lg border bg-muted/30 p-4"
        >
          {/* Цена */}
          <div className="space-y-1">
            <p className="text-xs font-medium text-muted-foreground">Цена, ₽</p>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="От"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                className="w-24"
                min={0}
              />
              <span className="text-muted-foreground">—</span>
              <Input
                type="number"
                placeholder="До"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                className="w-24"
                min={0}
              />
              <Button type="submit" size="sm" variant="secondary">
                Применить
              </Button>
            </div>
          </div>

          {/* Наличие */}
          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={inStock}
              onChange={(e) => handleInStockChange(e.target.checked)}
              className="h-4 w-4 rounded border"
            />
            Только в наличии
          </label>
        </form>
      )}
    </div>
  )
}
