'use client'

import { Trash2, Plus } from 'lucide-react'
import type { CasesBlockData, CaseItem } from '@/types/blocks'
import { useEditorStore } from '@/store/editor.store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { MediaPicker } from '../MediaPicker'

interface Props {
  blockId: string
  data: CasesBlockData
}

export function CasesForm({ blockId, data }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock)

  function upd(changes: Partial<CasesBlockData>) {
    updateBlock(blockId, { data: { ...data, ...changes } })
  }

  function updItem(index: number, changes: Partial<CaseItem>) {
    upd({ items: data.items.map((item, i) => (i === index ? { ...item, ...changes } : item)) })
  }

  function addItem() {
    upd({ items: [...data.items, { title: 'Кейс', category: '' }] })
  }

  function removeItem(index: number) {
    upd({ items: data.items.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Заголовок секции</Label>
        <Input
          value={data.heading ?? ''}
          onChange={(e) => upd({ heading: e.target.value })}
          placeholder="Наши кейсы"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Подзаголовок</Label>
        <Input
          value={data.subheading ?? ''}
          onChange={(e) => upd({ subheading: e.target.value })}
        />
      </div>

      <div className="space-y-2 border-t pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Кейсы ({data.items.length})
          </p>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Добавить
          </Button>
        </div>

        {data.items.map((item, index) => (
          <div key={index} className="rounded-md border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">#{index + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:text-destructive"
                onClick={() => removeItem(index)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Обложка</Label>
              <MediaPicker
                value={item.image ?? ''}
                onChange={(url) => updItem(index, { image: url })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Название</Label>
                <Input
                  value={item.title}
                  onChange={(e) => updItem(index, { title: e.target.value })}
                  placeholder="Название кейса"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Категория</Label>
                <Input
                  value={item.category ?? ''}
                  onChange={(e) => updItem(index, { category: e.target.value })}
                  placeholder="Веб-разработка"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Описание</Label>
              <Textarea
                value={item.text ?? ''}
                onChange={(e) => updItem(index, { text: e.target.value })}
                placeholder="Краткое описание кейса"
                rows={2}
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Ссылка</Label>
              <Input
                value={item.link ?? ''}
                onChange={(e) => updItem(index, { link: e.target.value })}
                placeholder="/cases/my-case"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
