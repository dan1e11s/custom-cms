import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { cn } from '@/lib/utils'
import type { FeaturesBlockData } from '@/types/blocks'

const COLS: Record<number, string> = {
  2: 'sm:grid-cols-2',
  3: 'sm:grid-cols-2 lg:grid-cols-3',
  4: 'sm:grid-cols-2 lg:grid-cols-4',
}

export function FeaturesBlock({ data }: { data: FeaturesBlockData }) {
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
        <div className={cn('grid grid-cols-1 gap-8', COLS[cols])}>
          {data.items.map((item, i) => (
            <div key={i} className="flex flex-col gap-3">
              {item.icon && (
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-2xl">
                  {item.icon}
                </div>
              )}
              <h3 className="text-xl font-semibold text-gray-900">{item.title}</h3>
              <p className="leading-relaxed text-gray-500">{item.text}</p>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
