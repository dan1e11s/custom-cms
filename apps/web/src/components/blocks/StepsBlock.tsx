import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import type { StepsBlockData } from '@/types/blocks'

export function StepsBlock({ data }: { data: StepsBlockData }) {
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
        <div className="relative mx-auto max-w-3xl">
          {/* Вертикальная линия */}
          <div className="absolute left-5 top-0 h-full w-0.5 bg-gray-200 md:left-1/2" />

          <div className="flex flex-col gap-8">
            {data.items.map((step, i) => (
              <div key={i} className="relative flex items-start gap-6 md:even:flex-row-reverse">
                {/* Номер шага */}
                <div className="relative z-10 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary font-bold text-white shadow md:left-1/2 md:-translate-x-1/2">
                  {i + 1}
                </div>
                {/* Контент */}
                <div className="flex-1 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <h3 className="mb-1 text-lg font-semibold text-gray-900">{step.title}</h3>
                  {step.text && <p className="text-gray-500">{step.text}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </Section>
  )
}
