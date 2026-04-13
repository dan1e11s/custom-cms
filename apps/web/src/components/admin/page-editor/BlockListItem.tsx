'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Eye, EyeOff, Trash2 } from 'lucide-react'
import { useEditorStore } from '@/store/editor.store'
import { BLOCK_META } from '@/components/blocks/meta'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { BlockConfig } from '@/types/blocks'

interface Props {
  block: BlockConfig
}

export function BlockListItem({ block }: Props) {
  const { selectedBlockId, selectBlock, toggleBlock, removeBlock } = useEditorStore()
  const meta = BLOCK_META[block.type]
  const isSelected = selectedBlockId === block.id

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: block.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group flex items-center gap-1.5 rounded-md px-2 py-2 mb-1 cursor-pointer select-none border transition-colors',
        isSelected
          ? 'border-primary bg-primary/5 text-primary'
          : 'border-transparent hover:bg-muted/60',
        isDragging && 'opacity-50 z-50',
        !block.enabled && 'opacity-50',
      )}
      onClick={() => selectBlock(block.id)}
    >
      {/* Drag handle */}
      <button
        type="button"
        className="cursor-grab touch-none p-0.5 text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Icon */}
      <span className="text-base leading-none shrink-0">{meta.icon}</span>

      {/* Label */}
      <span className="flex-1 text-sm font-medium truncate">{meta.label}</span>

      {/* Actions (appear on hover) */}
      <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground"
          title={block.enabled ? 'Скрыть блок' : 'Показать блок'}
          onClick={(e) => {
            e.stopPropagation()
            toggleBlock(block.id)
          }}
        >
          {block.enabled ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-6 w-6 text-muted-foreground hover:text-destructive"
          title="Удалить блок"
          onClick={(e) => {
            e.stopPropagation()
            removeBlock(block.id)
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  )
}
