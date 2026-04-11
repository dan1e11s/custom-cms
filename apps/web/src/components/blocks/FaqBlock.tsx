'use client'

import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import { cn } from '@/lib/utils'
import type { FaqBlockData } from '@/types/blocks'
import { ChevronDown } from 'lucide-react'
import { useState } from 'react'

export function FaqBlock({ data }: { data: FaqBlockData }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  return (
    <Section className="bg-gray-50">
      <Container>
        {data.heading && (
          <h2 className="mb-10 text-center text-3xl font-bold text-gray-900">{data.heading}</h2>
        )}
        <div className="mx-auto max-w-2xl divide-y divide-gray-200 rounded-xl border border-gray-200 bg-white">
          {data.items.map((item, i) => {
            const isOpen = openIndex === i
            return (
              <div key={i}>
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition-colors hover:bg-gray-50"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-gray-900">{item.question}</span>
                  <ChevronDown
                    className={cn(
                      'size-5 shrink-0 text-gray-400 transition-transform duration-200',
                      isOpen && 'rotate-180',
                    )}
                  />
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 text-gray-600 leading-relaxed">{item.answer}</div>
                )}
              </div>
            )
          })}
        </div>
      </Container>
    </Section>
  )
}
