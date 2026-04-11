import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { cn } from '@/lib/utils'
import type { BannerBlockData } from '@/types/blocks'

export function BannerBlock({ data }: { data: BannerBlockData }) {
  const minH = data.minHeight ?? '60vh'

  return (
    <section
      className="relative flex items-center bg-gray-900 bg-cover bg-center"
      style={{
        backgroundImage: data.backgroundImage ? `url(${data.backgroundImage})` : undefined,
        minHeight: minH,
      }}
    >
      {data.overlay && <div className="absolute inset-0 bg-black/50" />}
      <Container className="relative z-10 py-16">
        <div
          className={cn(
            'max-w-2xl',
            data.textAlign === 'center' && 'mx-auto text-center',
            data.textAlign === 'right' && 'ml-auto text-right',
          )}
        >
          <h1 className="mb-4 text-4xl font-bold text-white md:text-5xl">{data.heading}</h1>
          {data.subheading && <p className="mb-2 text-xl text-white/90">{data.subheading}</p>}
          {data.description && <p className="mb-8 text-white/80">{data.description}</p>}
          {(data.ctaText || data.ctaSecondaryText) && (
            <div
              className={cn(
                'flex flex-wrap gap-4',
                data.textAlign === 'center' && 'justify-center',
                data.textAlign === 'right' && 'justify-end',
              )}
            >
              {data.ctaText && (
                <Button asChild size="lg" className="bg-accent text-white hover:bg-accent/90">
                  <a href={data.ctaUrl || '#'}>{data.ctaText}</a>
                </Button>
              )}
              {data.ctaSecondaryText && (
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-white text-white hover:bg-white/10"
                >
                  <a href={data.ctaSecondaryUrl || '#'}>{data.ctaSecondaryText}</a>
                </Button>
              )}
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
