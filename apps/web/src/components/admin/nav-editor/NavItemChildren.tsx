'use client'

import { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical, Eye, EyeOff, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/lib/api/site'
import { NavItemDialog } from './NavItemDialog'

const TYPE_LABELS: Record<string, string> = {
  PAGE: 'страница',
  CATALOG: 'каталог',
  BLOG: 'блог',
  FORUM: 'форум',
  GRAM: 'грам',
  EXTERNAL: 'внешняя',
  DROPDOWN: 'группа',
}

function ChildRow({
  item,
  onUpdate,
  onDelete,
}: {
  item: NavItem
  onUpdate: (id: number, data: Partial<NavItem>) => Promise<void>
  onDelete: (id: number) => Promise<void>
}) {
  const [editOpen, setEditOpen] = useState(false)
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })
  const style = { transform: CSS.Transform.toString(transform), transition }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'flex items-center gap-2 rounded-md border border-border/60 bg-muted/30 px-2 py-2 text-sm',
        isDragging && 'opacity-50',
      )}
    >
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-muted-foreground hover:text-foreground"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>

      <span className="flex-1 font-medium">{item.label}</span>

      <Badge variant="outline" className="text-xs">
        {TYPE_LABELS[item.type] ?? item.type}
      </Badge>

      {item.href && (
        <span className="hidden text-xs text-muted-foreground md:block">{item.href}</span>
      )}

      <button
        onClick={() => onUpdate(item.id, { isVisible: !item.isVisible })}
        className="rounded p-0.5 text-muted-foreground hover:text-foreground"
      >
        {item.isVisible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
      </button>

      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setEditOpen(true)}>
        <Pencil className="h-3 w-3" />
      </Button>

      <Button
        variant="ghost"
        size="icon"
        className="h-6 w-6 text-destructive hover:text-destructive"
        onClick={() => {
          if (confirm(`Удалить "${item.label}"?`)) onDelete(item.id)
        }}
      >
        <Trash2 className="h-3 w-3" />
      </Button>

      <NavItemDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={(data) => onUpdate(item.id, data)}
        initial={item}
        title="Редактировать подпункт"
      />
    </div>
  )
}

interface Props {
  items: NavItem[]
  parentId: number
  onUpdate: (id: number, data: Partial<NavItem>) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onReorder: (parentId: number, ids: number[]) => Promise<void>
}

export function NavItemChildren({
  items: initialItems,
  parentId,
  onUpdate,
  onDelete,
  onReorder,
}: Props) {
  const [items, setItems] = useState(initialItems)
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id)
      const newIndex = items.findIndex((i) => i.id === over.id)
      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)
      onReorder(
        parentId,
        newItems.map((i) => i.id),
      )
    }
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
        <div className="space-y-1 py-1">
          {items.map((child) => (
            <ChildRow key={child.id} item={child} onUpdate={onUpdate} onDelete={onDelete} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
