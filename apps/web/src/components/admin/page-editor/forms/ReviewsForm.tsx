'use client'

import { Trash2, Plus } from 'lucide-react'
import type { ReviewsBlockData, ReviewItem } from '@/types/blocks'
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
  data: ReviewsBlockData
}

export function ReviewsForm({ blockId, data }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock)

  function upd(changes: Partial<ReviewsBlockData>) {
    updateBlock(blockId, { data: { ...data, ...changes } })
  }

  function updItem(index: number, changes: Partial<ReviewItem>) {
    upd({ items: data.items.map((item, i) => (i === index ? { ...item, ...changes } : item)) })
  }

  function addItem() {
    upd({ items: [...data.items, { text: 'Отличный сервис!', author: 'Имя Фамилия', rating: 5 }] })
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
          placeholder="Отзывы клиентов"
        />
      </div>

      <div className="space-y-2 border-t pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Отзывы ({data.items.length})
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
              <Label className="text-xs">Текст отзыва</Label>
              <Textarea
                value={item.text}
                onChange={(e) => updItem(index, { text: e.target.value })}
                placeholder="Текст отзыва..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Автор</Label>
                <Input
                  value={item.author}
                  onChange={(e) => updItem(index, { author: e.target.value })}
                  placeholder="Иван Иванов"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Должность/компания</Label>
                <Input
                  value={item.role ?? ''}
                  onChange={(e) => updItem(index, { role: e.target.value })}
                  placeholder="CEO, ООО «Компания»"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Рейтинг</Label>
                <Select
                  value={String(item.rating ?? 5)}
                  onValueChange={(v) => updItem(index, { rating: Number(v) })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[1, 2, 3, 4, 5].map((n) => (
                      <SelectItem key={n} value={String(n)}>
                        {'★'.repeat(n)} {n}/5
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Аватар</Label>
                <Input
                  value={item.avatar ?? ''}
                  onChange={(e) => updItem(index, { avatar: e.target.value })}
                  placeholder="URL фото"
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
