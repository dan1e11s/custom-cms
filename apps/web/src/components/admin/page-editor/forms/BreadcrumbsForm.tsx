'use client'

import { Trash2, Plus } from 'lucide-react'
import type { BreadcrumbsBlockData, BreadcrumbItem } from '@/types/blocks'
import { useEditorStore } from '@/store/editor.store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Props {
  blockId: string
  data: BreadcrumbsBlockData
}

export function BreadcrumbsForm({ blockId, data }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock)

  function upd(changes: Partial<BreadcrumbsBlockData>) {
    updateBlock(blockId, { data: { ...data, ...changes } })
  }

  function updItem(index: number, changes: Partial<BreadcrumbItem>) {
    upd({ items: data.items.map((item, i) => (i === index ? { ...item, ...changes } : item)) })
  }

  function addItem() {
    upd({ items: [...data.items, { label: 'Раздел', href: '/' }] })
  }

  function removeItem(index: number) {
    upd({ items: data.items.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Последний элемент без ссылки — это текущая страница.
      </p>

      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Элементы цепочки ({data.items.length})
          </p>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Добавить
          </Button>
        </div>

        {data.items.map((item, index) => (
          <div key={index} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground shrink-0">{index + 1}</span>
            <div className="grid grid-cols-2 gap-2 flex-1">
              <div>
                <Label className="text-xs sr-only">Название</Label>
                <Input
                  value={item.label}
                  onChange={(e) => updItem(index, { label: e.target.value })}
                  placeholder="Название"
                />
              </div>
              <div>
                <Label className="text-xs sr-only">Ссылка</Label>
                <Input
                  value={item.href ?? ''}
                  onChange={(e) => updItem(index, { href: e.target.value || undefined })}
                  placeholder="/ (пусто = текущая)"
                />
              </div>
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-destructive"
              onClick={() => removeItem(index)}
              disabled={data.items.length <= 1}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
