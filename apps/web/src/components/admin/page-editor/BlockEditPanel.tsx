'use client'

import { MousePointer2 } from 'lucide-react'
import { useEditorStore } from '@/store/editor.store'
import { BLOCK_META } from '@/components/blocks/meta'
import type {
  BlockType,
  BlockData,
  BannerBlockData,
  FeaturesBlockData,
  CtaBlockData,
  FaqBlockData,
  CardsBlockData,
  InfoBlockData,
  ReviewsBlockData,
  StepsBlockData,
  ContactsBlockData,
  SliderBlockData,
  VideoBlockData,
  TableBlockData,
  CasesBlockData,
  BreadcrumbsBlockData,
} from '@/types/blocks'
import { BannerForm } from './forms/BannerForm'
import { FeaturesForm } from './forms/FeaturesForm'
import { CtaForm } from './forms/CtaForm'
import { FaqForm } from './forms/FaqForm'
import { CardsForm } from './forms/CardsForm'
import { InfoForm } from './forms/InfoForm'
import { ReviewsForm } from './forms/ReviewsForm'
import { StepsForm } from './forms/StepsForm'
import { ContactsForm } from './forms/ContactsForm'
import { SliderForm } from './forms/SliderForm'
import { VideoForm } from './forms/VideoForm'
import { TableForm } from './forms/TableForm'
import { CasesForm } from './forms/CasesForm'
import { BreadcrumbsForm } from './forms/BreadcrumbsForm'

function renderForm(blockId: string, type: BlockType, data: BlockData) {
  switch (type) {
    case 'banner':
      return <BannerForm key={blockId} blockId={blockId} data={data as BannerBlockData} />
    case 'features':
      return <FeaturesForm key={blockId} blockId={blockId} data={data as FeaturesBlockData} />
    case 'cta':
      return <CtaForm key={blockId} blockId={blockId} data={data as CtaBlockData} />
    case 'faq':
      return <FaqForm key={blockId} blockId={blockId} data={data as FaqBlockData} />
    case 'cards':
      return <CardsForm key={blockId} blockId={blockId} data={data as CardsBlockData} />
    case 'info':
      return <InfoForm key={blockId} blockId={blockId} data={data as InfoBlockData} />
    case 'reviews':
      return <ReviewsForm key={blockId} blockId={blockId} data={data as ReviewsBlockData} />
    case 'steps':
      return <StepsForm key={blockId} blockId={blockId} data={data as StepsBlockData} />
    case 'contacts':
      return <ContactsForm key={blockId} blockId={blockId} data={data as ContactsBlockData} />
    case 'slider':
      return <SliderForm key={blockId} blockId={blockId} data={data as SliderBlockData} />
    case 'video':
      return <VideoForm key={blockId} blockId={blockId} data={data as VideoBlockData} />
    case 'table':
      return <TableForm key={blockId} blockId={blockId} data={data as TableBlockData} />
    case 'cases':
      return <CasesForm key={blockId} blockId={blockId} data={data as CasesBlockData} />
    case 'breadcrumbs':
      return <BreadcrumbsForm key={blockId} blockId={blockId} data={data as BreadcrumbsBlockData} />
    default:
      return <p className="text-sm text-muted-foreground">Форма для этого блока не реализована</p>
  }
}

export function BlockEditPanel() {
  const { blocks, selectedBlockId } = useEditorStore()

  if (!selectedBlockId) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground">
        <MousePointer2 className="h-12 w-12 mb-4 opacity-20" />
        <p className="font-medium">Выберите блок для редактирования</p>
        <p className="text-sm mt-1 opacity-70">или добавьте новый через левую панель</p>
      </div>
    )
  }

  const block = blocks.find((b) => b.id === selectedBlockId)
  if (!block) return null

  const meta = BLOCK_META[block.type]

  return (
    <div>
      {/* Block header */}
      <div className="flex items-center gap-3 pb-5 mb-5 border-b">
        <span className="text-3xl leading-none">{meta.icon}</span>
        <div>
          <h2 className="font-semibold">{meta.label}</h2>
          <p className="text-xs text-muted-foreground">{meta.description}</p>
        </div>
      </div>

      {/* Block form */}
      {renderForm(block.id, block.type, block.data)}
    </div>
  )
}
