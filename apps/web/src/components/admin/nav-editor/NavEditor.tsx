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
  arrayMove,
} from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { siteAdminApi, type NavItem } from '@/lib/api/site'
import { NavItemRow } from './NavItemRow'
import { NavItemDialog } from './NavItemDialog'
import { toast } from '@/lib/toast'

interface Props {
  initialItems: NavItem[]
}

export function NavEditor({ initialItems }: Props) {
  const [items, setItems] = useState<NavItem[]>(initialItems)
  const [addOpen, setAddOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = items.findIndex((i) => i.id === active.id)
      const newIndex = items.findIndex((i) => i.id === over.id)
      const newItems = arrayMove(items, oldIndex, newIndex)
      setItems(newItems)
      try {
        await siteAdminApi.reorderNavItems(newItems.map((i) => i.id))
      } catch {
        toast.error('Ошибка при сортировке')
      }
    }
  }

  async function handleAdd(data: Partial<NavItem> & { label: string }) {
    try {
      const newItem = await siteAdminApi.createNavItem(data)
      setItems((prev) => [...prev, { ...newItem, children: [] }])
      toast.success('Пункт добавлен')
    } catch {
      toast.error('Ошибка при добавлении')
    }
  }

  async function handleUpdate(id: number, data: Partial<NavItem>) {
    try {
      const updated = await siteAdminApi.updateNavItem(id, data)
      setItems((prev) => prev.map((item) => (item.id === id ? { ...item, ...updated } : item)))
      toast.success('Сохранено')
    } catch {
      toast.error('Ошибка при обновлении')
    }
  }

  async function handleDelete(id: number) {
    try {
      await siteAdminApi.deleteNavItem(id)
      setItems((prev) => prev.filter((item) => item.id !== id))
      toast.success('Удалено')
    } catch {
      toast.error('Ошибка при удалении')
    }
  }

  async function handleAddChild(parentId: number, data: Partial<NavItem> & { label: string }) {
    try {
      const newChild = await siteAdminApi.createNavItem({ ...data, parentId })
      setItems((prev) =>
        prev.map((item) =>
          item.id === parentId
            ? { ...item, children: [...item.children, { ...newChild, children: [] }] }
            : item,
        ),
      )
      toast.success('Подпункт добавлен')
    } catch {
      toast.error('Ошибка при добавлении подпункта')
    }
  }

  async function handleUpdateChild(id: number, data: Partial<NavItem>) {
    try {
      const updated = await siteAdminApi.updateNavItem(id, data)
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          children: item.children.map((child) =>
            child.id === id ? { ...child, ...updated } : child,
          ),
        })),
      )
      toast.success('Сохранено')
    } catch {
      toast.error('Ошибка при обновлении')
    }
  }

  async function handleDeleteChild(id: number) {
    try {
      await siteAdminApi.deleteNavItem(id)
      setItems((prev) =>
        prev.map((item) => ({
          ...item,
          children: item.children.filter((child) => child.id !== id),
        })),
      )
      toast.success('Удалено')
    } catch {
      toast.error('Ошибка при удалении')
    }
  }

  async function handleReorderChildren(parentId: number, ids: number[]) {
    try {
      await siteAdminApi.reorderNavItems(ids)
      setItems((prev) =>
        prev.map((item) => {
          if (item.id !== parentId) return item
          const reordered = ids
            .map((id) => item.children.find((c) => c.id === id))
            .filter(Boolean) as NavItem[]
          return { ...item, children: reordered }
        }),
      )
    } catch {
      toast.error('Ошибка при сортировке')
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Перетащите пункты для изменения порядка. Нажмите «Подпункт» для добавления дочернего
          элемента.
        </p>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить раздел
        </Button>
      </div>

      {items.length === 0 && (
        <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          Нет пунктов навигации. Добавьте первый раздел.
        </div>
      )}

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((item) => (
              <NavItemRow
                key={item.id}
                item={item}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
                onAddChild={handleAddChild}
                onUpdateChild={handleUpdateChild}
                onDeleteChild={handleDeleteChild}
                onReorderChildren={handleReorderChildren}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>

      <NavItemDialog
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={handleAdd}
        title="Добавить раздел"
      />
    </div>
  )
}
