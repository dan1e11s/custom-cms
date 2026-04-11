import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import type { CasesBlockData } from '@/types/blocks'
import { ArrowRight } from 'lucide-react'

export function CasesBlock({ data }: { data: CasesBlockData }) {
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((c, i) => (
            <div
              key={i}
              className="group overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
            >
              {c.image && (
                <div className="h-52 overflow-hidden bg-gray-100">
                  <img
                    src={c.image}
                    alt={c.title}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
              )}
              <div className="p-5">
                {c.category && (
                  <Badge variant="secondary" className="mb-2">
                    {c.category}
                  </Badge>
                )}
                <h3 className="mb-2 text-lg font-semibold text-gray-900">{c.title}</h3>
                {c.text && <p className="mb-4 text-sm text-gray-500">{c.text}</p>}
                {c.link && (
                  <a
                    href={c.link}
                    className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                  >
                    Смотреть кейс
                    <ArrowRight className="size-4" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
