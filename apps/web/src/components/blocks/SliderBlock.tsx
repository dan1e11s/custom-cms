'use client'

import { Container } from '@/components/ui/container'
import { cn } from '@/lib/utils'
import type { SliderBlockData } from '@/types/blocks'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'

export function SliderBlock({ data }: { data: SliderBlockData }) {
  const [current, setCurrent] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const total = data.items.length

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + total) % total)
  }, [total])

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % total)
  }, [total])

  useEffect(() => {
    if (!data.autoplay || total <= 1) return
    intervalRef.current = setInterval(next, (data.interval ?? 4) * 1000)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [data.autoplay, data.interval, next, total])

  if (total === 0) return null

  return (
    <section className="py-10">
      {data.heading && (
        <Container>
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">{data.heading}</h2>
        </Container>
      )}
      <div className="relative overflow-hidden">
        {/* Слайды */}
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${current * 100}%)` }}
        >
          {data.items.map((item, i) => (
            <div key={i} className="relative min-w-full">
              <img
                src={item.image}
                alt={item.alt || `Слайд ${i + 1}`}
                className="h-[400px] w-full object-cover md:h-[520px]"
              />
              {item.caption && (
                <div className="absolute bottom-0 left-0 right-0 bg-black/40 p-4 text-center text-white">
                  {item.caption}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Кнопки навигации */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={prev}
              className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm hover:bg-black/60"
              aria-label="Предыдущий слайд"
            >
              <ChevronLeft className="size-6" />
            </button>
            <button
              type="button"
              onClick={next}
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full bg-black/40 p-2 text-white backdrop-blur-sm hover:bg-black/60"
              aria-label="Следующий слайд"
            >
              <ChevronRight className="size-6" />
            </button>

            {/* Точки */}
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-2">
              {data.items.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  className={cn(
                    'size-2 rounded-full transition-all',
                    i === current ? 'w-6 bg-white' : 'bg-white/50',
                  )}
                  aria-label={`Слайд ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  )
}
