'use client'

import { useState } from 'react'
import {
  GripVertical,
  Eye,
  EyeOff,
  Pencil,
  Trash2,
  Plus,
  ChevronDown,
  ChevronRight,
} from 'lucide-react'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { NavItem } from '@/lib/api/site'
import { NavItemDialog } from './NavItemDialog'
import { NavItemChildren } from './NavItemChildren'

const TYPE_LABELS: Record<string, string> = {
  PAGE: 'страница',
  CATALOG: 'каталог',
  BLOG: 'блог',
  FORUM: 'форум',
  GRAM: 'грам',
  EXTERNAL: 'внешняя',
  DROPDOWN: 'группа',
}

interface Props {
  item: NavItem
  onUpdate: (id: number, data: Partial<NavItem>) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onAddChild: (parentId: number, data: Partial<NavItem> & { label: string }) => Promise<void>
  onUpdateChild: (id: number, data: Partial<NavItem>) => Promise<void>
  onDeleteChild: (id: number) => Promise<void>
  onReorderChildren: (parentId: number, ids: number[]) => Promise<void>
}

export function NavItemRow({
  item,
  onUpdate,
  onDelete,
  onAddChild,
  onUpdateChild,
  onDeleteChild,
  onReorderChildren,
}: Props) {
  const [editOpen, setEditOpen] = useState(false)
  const [addChildOpen, setAddChildOpen] = useState(false)
  const [childrenExpanded, setChildrenExpanded] = useState(true)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const hasChildren = item.children.length > 0

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'rounded-lg border border-border bg-card',
        isDragging && 'opacity-50 shadow-lg',
      )}
    >
      <div className="flex items-center gap-2 px-3 py-2.5">
        {/* Drag handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-4 w-4" />
        </button>

        {/* Expand/collapse для children */}
        {hasChildren ? (
          <button
            onClick={() => setChildrenExpanded((e) => !e)}
            className="text-muted-foreground hover:text-foreground"
          >
            {childrenExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        ) : (
          <span className="w-4" />
        )}

        {/* Метка */}
        <span className="flex-1 text-sm font-medium">{item.label}</span>

        {/* Тип */}
        <Badge variant="outline" className="text-xs">
          {TYPE_LABELS[item.type] ?? item.type}
        </Badge>

        {/* URL preview */}
        {item.href && (
          <span className="hidden text-xs text-muted-foreground md:block">{item.href}</span>
        )}

        {/* Visibility toggle */}
        <button
          onClick={() => onUpdate(item.id, { isVisible: !item.isVisible })}
          className={cn(
            'rounded p-1 transition-colors',
            item.isVisible
              ? 'text-muted-foreground hover:text-foreground'
              : 'text-muted-foreground/40 hover:text-muted-foreground',
          )}
          title={item.isVisible ? 'Скрыть' : 'Показать'}
        >
          {item.isVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </button>

        {/* + Подпункт */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setAddChildOpen(true)}
          className="h-7 px-2 text-xs"
        >
          <Plus className="h-3 w-3 mr-1" />
          Подпункт
        </Button>

        {/* Edit */}
        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setEditOpen(true)}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>

        {/* Delete */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={() => {
            if (confirm(`Удалить "${item.label}"${hasChildren ? ' и все его подпункты' : ''}?`)) {
              onDelete(item.id)
            }
          }}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {/* Дочерние пункты */}
      {hasChildren && childrenExpanded && (
        <div className="border-t border-border px-3 pb-2 pt-1">
          <NavItemChildren
            items={item.children}
            parentId={item.id}
            onUpdate={onUpdateChild}
            onDelete={onDeleteChild}
            onReorder={onReorderChildren}
          />
        </div>
      )}

      {/* Диалог редактирования */}
      <NavItemDialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        onSave={(data) => onUpdate(item.id, data)}
        initial={item}
        title="Редактировать пункт"
      />

      {/* Диалог добавления подпункта */}
      <NavItemDialog
        open={addChildOpen}
        onClose={() => setAddChildOpen(false)}
        onSave={(data) => onAddChild(item.id, data)}
        title="Добавить подпункт"
      />
    </div>
  )
}
