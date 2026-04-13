'use client'

import type { InfoBlockData } from '@/types/blocks'
import { useEditorStore } from '@/store/editor.store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MediaPicker } from '../MediaPicker'
import { RichTextEditor } from '../RichTextEditor'

interface Props {
  blockId: string
  data: InfoBlockData
}

export function InfoForm({ blockId, data }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock)

  function upd(changes: Partial<InfoBlockData>) {
    updateBlock(blockId, { data: { ...data, ...changes } })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Заголовок</Label>
        <Input
          value={data.heading ?? ''}
          onChange={(e) => upd({ heading: e.target.value })}
          placeholder="О нас"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Текст</Label>
        <RichTextEditor value={data.text} onChange={(html) => upd({ text: html })} />
      </div>

      <div className="space-y-1.5">
        <Label>Изображение</Label>
        <MediaPicker value={data.image ?? ''} onChange={(url) => upd({ image: url })} />
      </div>

      {data.image && (
        <div className="space-y-1.5">
          <Label>Alt-текст изображения</Label>
          <Input
            value={data.imageAlt ?? ''}
            onChange={(e) => upd({ imageAlt: e.target.value })}
            placeholder="Описание для screen-reader"
          />
        </div>
      )}

      <div className="space-y-1.5">
        <Label>Расположение изображения</Label>
        <Select
          value={data.imagePosition ?? 'right'}
          onValueChange={(v) => upd({ imagePosition: v as 'left' | 'right' })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">Слева от текста</SelectItem>
            <SelectItem value="right">Справа от текста</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Кнопка (опционально)
        </p>
        <div className="space-y-1.5">
          <Label>Текст кнопки</Label>
          <Input
            value={data.ctaText ?? ''}
            onChange={(e) => upd({ ctaText: e.target.value })}
            placeholder="Читать подробнее"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Ссылка</Label>
          <Input
            value={data.ctaUrl ?? ''}
            onChange={(e) => upd({ ctaUrl: e.target.value })}
            placeholder="/about"
          />
        </div>
      </div>
    </div>
  )
}
