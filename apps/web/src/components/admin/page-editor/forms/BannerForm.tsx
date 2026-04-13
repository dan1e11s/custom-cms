'use client'

import type { BannerBlockData } from '@/types/blocks'
import { useEditorStore } from '@/store/editor.store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
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
  data: BannerBlockData
}

export function BannerForm({ blockId, data }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock)

  function upd(changes: Partial<BannerBlockData>) {
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
          placeholder="Заголовок страницы"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Подзаголовок</Label>
        <Input
          value={data.subheading ?? ''}
          onChange={(e) => upd({ subheading: e.target.value })}
          placeholder="Краткий подзаголовок"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Описание</Label>
        <Textarea
          value={data.description ?? ''}
          onChange={(e) => upd({ description: e.target.value })}
          placeholder="Дополнительный текст под заголовком"
          rows={3}
        />
      </div>

      <div className="space-y-1.5">
        <Label>Фоновое изображение</Label>
        <MediaPicker
          value={data.backgroundImage ?? ''}
          onChange={(url) => upd({ backgroundImage: url })}
        />
      </div>

      <div className="flex items-center justify-between">
        <Label>Тёмный оверлей</Label>
        <Switch checked={data.overlay ?? false} onCheckedChange={(v) => upd({ overlay: v })} />
      </div>

      <div className="space-y-1.5">
        <Label>Выравнивание текста</Label>
        <Select
          value={data.textAlign ?? 'left'}
          onValueChange={(v) => upd({ textAlign: v as BannerBlockData['textAlign'] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="left">По левому краю</SelectItem>
            <SelectItem value="center">По центру</SelectItem>
            <SelectItem value="right">По правому краю</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-1.5">
        <Label>Минимальная высота</Label>
        <Select
          value={data.minHeight ?? '60vh'}
          onValueChange={(v) => upd({ minHeight: v as BannerBlockData['minHeight'] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="40vh">40vh (компактный)</SelectItem>
            <SelectItem value="60vh">60vh (средний)</SelectItem>
            <SelectItem value="80vh">80vh (большой)</SelectItem>
            <SelectItem value="100vh">100vh (полный экран)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-3 border-t pt-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Основная кнопка
        </p>
        <div className="space-y-1.5">
          <Label>Текст</Label>
          <Input
            value={data.ctaText ?? ''}
            onChange={(e) => upd({ ctaText: e.target.value })}
            placeholder="Связаться с нами"
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
