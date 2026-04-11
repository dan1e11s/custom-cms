import dynamic from 'next/dynamic'
import type { ComponentType } from 'react'
import type { BlockType } from '@/types/blocks'

// Все блоки загружаются динамически — уменьшает начальный JS-бандл страниц
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const BLOCK_COMPONENTS: Record<BlockType, ComponentType<{ data: any }>> = {
  banner: dynamic(() => import('./BannerBlock').then((m) => ({ default: m.BannerBlock }))),
  slider: dynamic(() => import('./SliderBlock').then((m) => ({ default: m.SliderBlock }))),
  video: dynamic(() => import('./VideoBlock').then((m) => ({ default: m.VideoBlock }))),
  features: dynamic(() => import('./FeaturesBlock').then((m) => ({ default: m.FeaturesBlock }))),
  info: dynamic(() => import('./InfoBlock').then((m) => ({ default: m.InfoBlock }))),
  cards: dynamic(() => import('./CardsBlock').then((m) => ({ default: m.CardsBlock }))),
  table: dynamic(() => import('./TableBlock').then((m) => ({ default: m.TableBlock }))),
  steps: dynamic(() => import('./StepsBlock').then((m) => ({ default: m.StepsBlock }))),
  cases: dynamic(() => import('./CasesBlock').then((m) => ({ default: m.CasesBlock }))),
  reviews: dynamic(() => import('./ReviewsBlock').then((m) => ({ default: m.ReviewsBlock }))),
  faq: dynamic(() => import('./FaqBlock').then((m) => ({ default: m.FaqBlock }))),
  cta: dynamic(() => import('./CtaBlock').then((m) => ({ default: m.CtaBlock }))),
  contacts: dynamic(() => import('./ContactsBlock').then((m) => ({ default: m.ContactsBlock }))),
  breadcrumbs: dynamic(() =>
    import('./BreadcrumbsBlock').then((m) => ({ default: m.BreadcrumbsBlock })),
  ),
}

// Метаданные блоков — используются в конструкторе (BlockAddModal)
export { BLOCK_META } from './meta'
