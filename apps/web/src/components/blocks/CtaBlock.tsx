import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { cn } from '@/lib/utils'
import type { CtaBlockData } from '@/types/blocks'

const BG: Record<string, string> = {
  primary: 'bg-primary text-white',
  dark: 'bg-gray-900 text-white',
  light: 'bg-gray-50 text-gray-900',
}

export function CtaBlock({ data }: { data: CtaBlockData }) {
  const bg = BG[data.background ?? 'primary']
  const isLight = data.background === 'light'

  return (
    <section className={cn('py-16 md:py-24', bg)}>
      <Container>
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl">{data.heading}</h2>
          {data.subheading && (
            <p className={cn('mb-8 text-lg', isLight ? 'text-gray-500' : 'text-white/80')}>
              {data.subheading}
            </p>
          )}
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              size="lg"
              className={cn(
                isLight
                  ? 'bg-primary text-white hover:bg-primary/90'
                  : 'bg-white text-primary hover:bg-white/90',
              )}
            >
              <a href={data.ctaUrl || '#'}>{data.ctaText}</a>
            </Button>
            {data.ctaSecondaryText && (
              <Button
                asChild
                variant="outline"
                size="lg"
                className={cn(
                  isLight
                    ? 'border-gray-300 text-gray-700'
                    : 'border-white/40 text-white hover:bg-white/10',
                )}
              >
                <a href={data.ctaSecondaryUrl || '#'}>{data.ctaSecondaryText}</a>
              </Button>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}
