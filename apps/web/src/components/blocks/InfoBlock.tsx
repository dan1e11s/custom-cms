import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { cn } from '@/lib/utils'
import type { InfoBlockData } from '@/types/blocks'

export function InfoBlock({ data }: { data: InfoBlockData }) {
  const imgRight = data.imagePosition !== 'left'

  return (
    <Section>
      <Container>
        <div
          className={cn(
            'flex flex-col items-center gap-10 md:flex-row',
            !imgRight && 'md:flex-row-reverse',
          )}
        >
          {/* Текстовая часть */}
          <div className="flex-1">
            {data.heading && (
              <h2 className="mb-4 text-3xl font-bold text-gray-900">{data.heading}</h2>
            )}
            <div
              className="prose prose-gray max-w-none"
              dangerouslySetInnerHTML={{ __html: data.text }}
            />
            {data.ctaText && (
              <Button asChild className="mt-6">
                <a href={data.ctaUrl || '#'}>{data.ctaText}</a>
              </Button>
            )}
          </div>

          {/* Изображение */}
          {data.image && (
            <div className="w-full overflow-hidden rounded-xl md:w-5/12">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={data.image}
                alt={data.imageAlt || ''}
                className="h-auto w-full object-cover"
              />
            </div>
          )}
        </div>
      </Container>
    </Section>
  )
}
