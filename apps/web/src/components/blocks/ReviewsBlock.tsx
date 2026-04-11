import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import type { ReviewsBlockData } from '@/types/blocks'
import { Star } from 'lucide-react'

export function ReviewsBlock({ data }: { data: ReviewsBlockData }) {
  return (
    <Section className="bg-gray-50">
      <Container>
        {data.heading && (
          <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">{data.heading}</h2>
        )}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {data.items.map((review, i) => (
            <div
              key={i}
              className="flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              {review.rating !== undefined && (
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, idx) => (
                    <Star
                      key={idx}
                      className="size-4"
                      fill={idx < review.rating! ? '#F59E0B' : 'none'}
                      stroke={idx < review.rating! ? '#F59E0B' : '#D1D5DB'}
                    />
                  ))}
                </div>
              )}
              <p className="flex-1 leading-relaxed text-gray-600">{review.text}</p>
              <div className="flex items-center gap-3 border-t border-gray-100 pt-4">
                {review.avatar ? (
                  <img
                    src={review.avatar}
                    alt={review.author}
                    className="size-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex size-10 items-center justify-center rounded-full bg-primary/10 text-sm font-bold text-primary">
                    {review.author.charAt(0).toUpperCase()}
                  </div>
                )}
                <div>
                  <p className="font-semibold text-gray-900">{review.author}</p>
                  {review.role && <p className="text-sm text-gray-400">{review.role}</p>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  )
}
