'use client'

import { Trash2, Plus } from 'lucide-react'
import type { SliderBlockData, SliderItem } from '@/types/blocks'
import { useEditorStore } from '@/store/editor.store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { MediaPicker } from '../MediaPicker'

interface Props {
  blockId: string
  data: SliderBlockData
}

export function SliderForm({ blockId, data }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock)

  function upd(changes: Partial<SliderBlockData>) {
    updateBlock(blockId, { data: { ...data, ...changes } })
  }

  function updItem(index: number, changes: Partial<SliderItem>) {
    upd({ items: data.items.map((item, i) => (i === index ? { ...item, ...changes } : item)) })
  }

  function addItem() {
    upd({ items: [...data.items, { image: '', alt: '', caption: '' }] })
  }

  function removeItem(index: number) {
    upd({ items: data.items.filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Заголовок</Label>
        <Input
          value={data.heading ?? ''}
          onChange={(e) => upd({ heading: e.target.value })}
          placeholder="Галерея"
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Автопрокрутка</Label>
        <Switch checked={data.autoplay ?? false} onCheckedChange={(v) => upd({ autoplay: v })} />
      </div>

      {data.autoplay && (
        <div className="space-y-1.5">
          <Label>Интервал (сек)</Label>
          <Input
            type="number"
            value={data.interval ?? 4}
            onChange={(e) => upd({ interval: Number(e.target.value) })}
            min={1}
            max={30}
          />
        </div>
      )}

      <div className="space-y-2 border-t pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Слайды ({data.items.length})
          </p>
          <Button type="button" variant="outline" size="sm" onClick={addItem}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Добавить
          </Button>
        </div>

        {data.items.map((item, index) => (
          <div key={index} className="rounded-md border p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Слайд {index + 1}</span>
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
              <MediaPicker value={item.image} onChange={(url) => updItem(index, { image: url })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <Label className="text-xs">Alt-текст</Label>
                <Input
                  value={item.alt ?? ''}
                  onChange={(e) => updItem(index, { alt: e.target.value })}
                  placeholder="Описание фото"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Подпись</Label>
                <Input
                  value={item.caption ?? ''}
                  onChange={(e) => updItem(index, { caption: e.target.value })}
                  placeholder="Подпись под фото"
                />
              </div>
            </div>
          </div>
        ))}

        {data.items.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Нет слайдов. Нажмите «Добавить».
          </p>
        )}
      </div>
    </div>
  )
}
