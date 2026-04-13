'use client'

import { Trash2, Plus } from 'lucide-react'
import type { CardsBlockData, CardItem } from '@/types/blocks'
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
import { MediaPicker } from '../MediaPicker'

interface Props {
  blockId: string
  data: CardsBlockData
}

export function CardsForm({ blockId, data }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock)

  function upd(changes: Partial<CardsBlockData>) {
    updateBlock(blockId, { data: { ...data, ...changes } })
  }

  function updItem(index: number, changes: Partial<CardItem>) {
    upd({ items: data.items.map((item, i) => (i === index ? { ...item, ...changes } : item)) })
  }

  function addItem() {
    upd({ items: [...data.items, { title: 'Карточка', text: 'Описание' }] })
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
          placeholder="Наши услуги"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Подзаголовок</Label>
        <Input
          value={data.subheading ?? ''}
          onChange={(e) => upd({ subheading: e.target.value })}
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
            Карточки ({data.items.length})
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
              <Label className="text-xs">Изображение</Label>
              <MediaPicker
                value={item.image ?? ''}
                onChange={(url) => updItem(index, { image: url })}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Заголовок</Label>
                <Input
                  value={item.title}
                  onChange={(e) => updItem(index, { title: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Бейдж</Label>
                <Input
                  value={item.badge ?? ''}
                  onChange={(e) => updItem(index, { badge: e.target.value })}
                  placeholder="Новинка"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Описание</Label>
              <Textarea
                value={item.text ?? ''}
                onChange={(e) => updItem(index, { text: e.target.value })}
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Цена</Label>
                <Input
                  value={item.price ?? ''}
                  onChange={(e) => updItem(index, { price: e.target.value })}
                  placeholder="от 1 000 ₽"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Текст кнопки</Label>
                <Input
                  value={item.linkText ?? ''}
                  onChange={(e) => updItem(index, { linkText: e.target.value })}
                  placeholder="Подробнее"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Ссылка</Label>
              <Input
                value={item.link ?? ''}
                onChange={(e) => updItem(index, { link: e.target.value })}
                placeholder="/services/my-service"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
