'use client'

import { useState } from 'react'
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { useEditorStore } from '@/store/editor.store'
import { Button } from '@/components/ui/button'
import { BlockListItem } from './BlockListItem'
import { BlockAddModal } from './BlockAddModal'

export function BlockList() {
  const { blocks, reorderBlocks } = useEditorStore()
  const [addModalOpen, setAddModalOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (!over || active.id === over.id) return
    reorderBlocks(String(active.id), String(over.id))
  }

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable block list */}
      <div className="flex-1 overflow-y-auto p-2">
        {blocks.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground mb-3">Страница пустая</p>
            <Button variant="outline" size="sm" onClick={() => setAddModalOpen(true)}>
              <Plus className="h-3.5 w-3.5 mr-1.5" />
              Добавить первый блок
            </Button>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext items={blocks.map((b) => b.id)} strategy={verticalListSortingStrategy}>
              {blocks.map((block) => (
                <BlockListItem key={block.id} block={block} />
              ))}
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Add block button */}
      {blocks.length > 0 && (
        <div className="shrink-0 border-t p-2">
          <Button variant="outline" className="w-full" onClick={() => setAddModalOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Добавить блок
          </Button>
        </div>
      )}

      <BlockAddModal open={addModalOpen} onClose={() => setAddModalOpen(false)} />
    </div>
  )
}
