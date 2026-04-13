'use client'

import { Trash2, Plus } from 'lucide-react'
import type { FaqBlockData, FaqItem } from '@/types/blocks'
import { useEditorStore } from '@/store/editor.store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface Props {
  blockId: string
  data: FaqBlockData
}

export function FaqForm({ blockId, data }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock)

  function upd(changes: Partial<FaqBlockData>) {
    updateBlock(blockId, { data: { ...data, ...changes } })
  }

  function updItem(index: number, changes: Partial<FaqItem>) {
    upd({ items: data.items.map((item, i) => (i === index ? { ...item, ...changes } : item)) })
  }

  function addItem() {
    upd({ items: [...data.items, { question: 'Вопрос?', answer: 'Ответ на вопрос' }] })
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
          placeholder="Часто задаваемые вопросы"
        />
      </div>

      <div className="space-y-2 border-t pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Вопросы и ответы ({data.items.length})
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
              <Label className="text-xs">Вопрос</Label>
              <Input
                value={item.question}
                onChange={(e) => updItem(index, { question: e.target.value })}
                placeholder="Вопрос?"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Ответ</Label>
              <Textarea
                value={item.answer}
                onChange={(e) => updItem(index, { answer: e.target.value })}
                placeholder="Подробный ответ на вопрос"
                rows={3}
              />
            </div>
          </div>
        ))}

        {data.items.length === 0 && (
          <p className="py-4 text-center text-sm text-muted-foreground">
            Нет вопросов. Нажмите «Добавить».
          </p>
        )}
      </div>
    </div>
  )
}
