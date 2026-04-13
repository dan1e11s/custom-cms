import Link from 'next/link'
import { cn } from '@/lib/utils'
import type { Category } from '@/types/catalog'

interface CategorySidebarProps {
  tree: Category[]
  activeCategorySlug?: string
}

function CategoryItem({
  category,
  activeCategorySlug,
  depth = 0,
}: {
  category: Category
  activeCategorySlug?: string
  depth?: number
}) {
  const isActive = category.slug === activeCategorySlug
  const hasChildren = category.children && category.children.length > 0

  return (
    <li>
      <Link
        href={`/catalog?categorySlug=${category.slug}`}
        className={cn(
          'block rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted',
          depth > 0 && 'text-muted-foreground',
          isActive && 'bg-primary/10 font-medium text-primary hover:bg-primary/10',
        )}
        style={{ paddingLeft: `${0.75 + depth * 1}rem` }}
      >
        {category.name}
      </Link>

      {hasChildren && (
        <ul className="mt-0.5 space-y-0.5">
          {category.children!.map((child) => (
            <CategoryItem
              key={child.id}
              category={child}
              activeCategorySlug={activeCategorySlug}
              depth={depth + 1}
            />
          ))}
        </ul>
      )}
    </li>
  )
}

export function CategorySidebar({ tree, activeCategorySlug }: CategorySidebarProps) {
  return (
    <nav aria-label="Категории каталога">
      <p className="mb-2 px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        Категории
      </p>

      <ul className="space-y-0.5">
        <li>
          <Link
            href="/catalog"
            className={cn(
              'block rounded-md px-3 py-1.5 text-sm transition-colors hover:bg-muted',
              !activeCategorySlug && 'bg-primary/10 font-medium text-primary hover:bg-primary/10',
            )}
          >
            Все товары
          </Link>
        </li>

        {tree.map((category) => (
          <CategoryItem
            key={category.id}
            category={category}
            activeCategorySlug={activeCategorySlug}
          />
        ))}
      </ul>
    </nav>
  )
}
