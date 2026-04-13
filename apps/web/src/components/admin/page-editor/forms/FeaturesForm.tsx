'use client'

import { Trash2, Plus } from 'lucide-react'
import type { FeaturesBlockData, FeatureItem } from '@/types/blocks'
import { useEditorStore } from '@/store/editor.store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Props {
  blockId: string
  data: FeaturesBlockData
}

export function FeaturesForm({ blockId, data }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock)

  function upd(changes: Partial<FeaturesBlockData>) {
    updateBlock(blockId, { data: { ...data, ...changes } })
  }

  function updItem(index: number, changes: Partial<FeatureItem>) {
    upd({ items: data.items.map((item, i) => (i === index ? { ...item, ...changes } : item)) })
  }

  function addItem() {
    upd({ items: [...data.items, { icon: '✅', title: 'Преимущество', text: 'Описание' }] })
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
          placeholder="Наши преимущества"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Подзаголовок</Label>
        <Input
          value={data.subheading ?? ''}
          onChange={(e) => upd({ subheading: e.target.value })}
          placeholder="Краткое описание секции"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Количество колонок</Label>
        <Select
          value={String(data.columns ?? 3)}
          onValueChange={(v) => upd({ columns: Number(v) as 2 | 3 | 4 })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2 колонки</SelectItem>
            <SelectItem value="3">3 колонки</SelectItem>
            <SelectItem value="4">4 колонки</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2 border-t pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Элементы ({data.items.length})
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
            <div className="grid grid-cols-4 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Иконка</Label>
                <Input
                  value={item.icon ?? ''}
                  onChange={(e) => updItem(index, { icon: e.target.value })}
                  placeholder="✅"
                  className="text-center"
                />
              </div>
              <div className="col-span-3 space-y-1">
                <Label className="text-xs">Заголовок</Label>
                <Input
                  value={item.title}
                  onChange={(e) => updItem(index, { title: e.target.value })}
                  placeholder="Название преимущества"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Описание</Label>
              <Textarea
                value={item.text}
                onChange={(e) => updItem(index, { text: e.target.value })}
                placeholder="Описание преимущества"
                rows={2}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
