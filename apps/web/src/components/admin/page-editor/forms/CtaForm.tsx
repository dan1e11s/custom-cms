'use client'

import type { CtaBlockData } from '@/types/blocks'
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

interface Props {
  blockId: string
  data: CtaBlockData
}

export function CtaForm({ blockId, data }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock)

  function upd(changes: Partial<CtaBlockData>) {
    updateBlock(blockId, { data: { ...data, ...changes } })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>
          Заголовок <span className="text-destructive">*</span>
        </Label>
        <Input
          value={data.heading}
          onChange={(e) => upd({ heading: e.target.value })}
          placeholder="Готовы начать?"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Подзаголовок</Label>
        <Input
          value={data.subheading ?? ''}
          onChange={(e) => upd({ subheading: e.target.value })}
          placeholder="Оставьте заявку и мы свяжемся с вами"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Фон секции</Label>
        <Select
          value={data.background ?? 'primary'}
          onValueChange={(v) => upd({ background: v as CtaBlockData['background'] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="primary">Основной цвет</SelectItem>
            <SelectItem value="dark">Тёмный</SelectItem>
            <SelectItem value="light">Светлый</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Основная кнопка
        </p>
        <div className="space-y-1.5">
          <Label>
            Текст <span className="text-destructive">*</span>
          </Label>
          <Input
            value={data.ctaText}
            onChange={(e) => upd({ ctaText: e.target.value })}
            placeholder="Оставить заявку"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Ссылка</Label>
          <Input
            value={data.ctaUrl ?? ''}
            onChange={(e) => upd({ ctaUrl: e.target.value })}
            placeholder="#contacts"
          />
        </div>
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Вторичная кнопка
        </p>
        <div className="space-y-1.5">
          <Label>Текст</Label>
          <Input
            value={data.ctaSecondaryText ?? ''}
            onChange={(e) => upd({ ctaSecondaryText: e.target.value })}
            placeholder="Узнать подробнее"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Ссылка</Label>
          <Input
            value={data.ctaSecondaryUrl ?? ''}
            onChange={(e) => upd({ ctaSecondaryUrl: e.target.value })}
            placeholder="/about"
          />
        </div>
      </div>
    </div>
  )
}
