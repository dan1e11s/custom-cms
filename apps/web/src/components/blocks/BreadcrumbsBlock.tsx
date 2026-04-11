import { Container } from '@/components/ui/container'
import type { BreadcrumbsBlockData } from '@/types/blocks'
import { ChevronRight } from 'lucide-react'

export function BreadcrumbsBlock({ data }: { data: BreadcrumbsBlockData }) {
  return (
    <section className="border-b border-gray-100 bg-gray-50 py-3">
      <Container>
        <nav aria-label="breadcrumb">
          <ol className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
            {data.items.map((item, i) => {
              const isLast = i === data.items.length - 1
              return (
                <li key={i} className="flex items-center gap-1">
                  {i > 0 && <ChevronRight className="size-3.5 text-gray-300" />}
                  {item.href && !isLast ? (
                    <a href={item.href} className="hover:text-primary hover:underline">
                      {item.label}
                    </a>
                  ) : (
                    <span className={isLast ? 'font-medium text-gray-900' : ''}>{item.label}</span>
                  )}
                </li>
              )
            })}
          </ol>
        </nav>
      </Container>
    </section>
  )
}
