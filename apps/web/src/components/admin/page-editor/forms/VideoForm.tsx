'use client'

import type { VideoBlockData } from '@/types/blocks'
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
  data: VideoBlockData
}

export function VideoForm({ blockId, data }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock)

  function upd(changes: Partial<VideoBlockData>) {
    updateBlock(blockId, { data: { ...data, ...changes } })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Заголовок</Label>
        <Input
          value={data.heading ?? ''}
          onChange={(e) => upd({ heading: e.target.value })}
          placeholder="Смотрите наш ролик"
        />
      </div>

      <div className="space-y-1.5">
        <Label>
          Ссылка на видео <span className="text-destructive">*</span>
        </Label>
        <Input
          value={data.url}
          onChange={(e) => upd({ url: e.target.value })}
          placeholder="https://www.youtube.com/watch?v=..."
        />
        <p className="text-xs text-muted-foreground">
          Поддерживается YouTube и Vimeo. Вставьте обычную ссылку — embed сгенерируется
          автоматически.
        </p>
      </div>

      <div className="space-y-1.5">
        <Label>Соотношение сторон</Label>
        <Select
          value={data.aspectRatio ?? '16/9'}
          onValueChange={(v) => upd({ aspectRatio: v as VideoBlockData['aspectRatio'] })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="16/9">16:9 (стандарт)</SelectItem>
            <SelectItem value="4/3">4:3</SelectItem>
            <SelectItem value="1/1">1:1 (квадрат)</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
