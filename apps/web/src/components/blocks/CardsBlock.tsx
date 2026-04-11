import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { cn } from '@/lib/utils'
import type { CardsBlockData } from '@/types/blocks'

const COLS: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

export function CardsBlock({ data }: { data: CardsBlockData }) {
  const cols = data.columns ?? 3

  return (
    <Section>
      <Container>
        {(data.heading || data.subheading) && (
          <div className="mb-12 text-center">
            {data.heading && (
              <h2 className="mb-3 text-3xl font-bold text-gray-900">{data.heading}</h2>
            )}
            {data.subheading && (
              <p className="mx-auto max-w-2xl text-lg text-gray-500">{data.subheading}</p>
            )}
          </div>
        )}
        <div className={cn('grid grid-cols-1 gap-6', COLS[cols])}>
          {data.items.map((card, i) => (
            <div
              key={i}
              className="flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-shadow hover:shadow-md"
            >
              {card.image && (
                <div className="relative h-48 overflow-hidden bg-gray-100">
                  <img src={card.image} alt={card.title} className="h-full w-full object-cover" />
                  {card.badge && <Badge className="absolute left-3 top-3">{card.badge}</Badge>}
                </div>
              )}
              <div className="flex flex-1 flex-col gap-2 p-5">
                <h3 className="text-lg font-semibold text-gray-900">{card.title}</h3>
                {card.text && <p className="flex-1 text-sm text-gray-500">{card.text}</p>}
                {card.price && <p className="text-xl font-bold text-primary">{card.price}</p>}
                {card.link && (
                  <Button asChild variant="outline" size="sm" className="mt-2 self-start">
                    <a href={card.link}>{card.linkText || 'Подробнее'}</a>
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
