import Link from 'next/link'
import Image from 'next/image'
import { Badge } from '@/components/ui/badge'
import type { Product } from '@/types/catalog'
import { cn } from '@/lib/utils'

interface ProductCardProps {
  product: Product
  className?: string
}

function formatPrice(value: string | null): string {
  if (!value) return ''
  const num = parseFloat(value)
  if (isNaN(num)) return ''
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(num)
}

export function ProductCard({ product, className }: ProductCardProps) {
  const href = `/catalog/${product.category?.slug ?? 'uncategorized'}/${product.slug}`
  const discount =
    product.oldPrice && product.price
      ? Math.round((1 - parseFloat(product.price) / parseFloat(product.oldPrice)) * 100)
      : null

  return (
    <Link
      href={href}
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md',
        className,
      )}
    >
      {/* Изображение */}
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        {product.images[0] ? (
          <Image
            src={product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-muted-foreground/40">
            <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          </div>
        )}

        {discount && (
          <Badge className="absolute left-2 top-2 bg-red-500 text-white hover:bg-red-500">
            -{discount}%
          </Badge>
        )}

        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40">
            <span className="rounded bg-black/70 px-2 py-1 text-xs font-medium text-white">
              Нет в наличии
            </span>
          </div>
        )}
      </div>

      {/* Контент */}
      <div className="flex flex-1 flex-col gap-2 p-4">
        <h3 className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-primary">
          {product.name}
        </h3>

        {product.description && (
          <p className="line-clamp-2 text-xs text-muted-foreground">{product.description}</p>
        )}

        {/* Цена */}
        <div className="mt-auto pt-2">
          {product.price ? (
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-foreground">
                {formatPrice(product.price)}
              </span>
              {product.oldPrice && (
                <span className="text-xs text-muted-foreground line-through">
                  {formatPrice(product.oldPrice)}
                </span>
              )}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">Цена по запросу</span>
          )}
        </div>
      </div>
    </Link>
  )
}
