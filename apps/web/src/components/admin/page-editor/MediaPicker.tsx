'use client'

import { useState } from 'react'
import { ImageIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

interface MediaPickerProps {
  value: string
  onChange: (url: string) => void
  placeholder?: string
}

export function MediaPicker({ value, onChange, placeholder }: MediaPickerProps) {
  const [open, setOpen] = useState(false)
  const [urlInput, setUrlInput] = useState('')

  function handleOpen() {
    setUrlInput(value)
    setOpen(true)
  }

  function handleApply() {
    onChange(urlInput)
    setOpen(false)
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'https://... или выберите из медиатеки'}
          className="flex-1 text-sm"
        />
        <Button type="button" variant="outline" size="icon" onClick={handleOpen} title="Медиатека">
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      {value && (
        <div className="relative h-24 w-full overflow-hidden rounded-md border bg-muted">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={value} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-1 top-1 rounded bg-background/80 px-1.5 py-0.5 text-xs hover:bg-background"
          >
            ✕
          </button>
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Медиатека</DialogTitle>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center h-40 text-muted-foreground border rounded-lg bg-muted/30">
            <ImageIcon className="h-10 w-10 mb-2 opacity-30" />
            <p className="text-sm">Медиатека будет реализована в шаге 2.6</p>
            <p className="text-xs mt-1 opacity-60">Используйте прямую ссылку на изображение</p>
          </div>

          <div className="space-y-1.5">
            <p className="text-xs text-muted-foreground">Или вставьте URL:</p>
            <Input
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://example.com/image.jpg"
              onKeyDown={(e) => e.key === 'Enter' && handleApply()}
              autoFocus
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleApply}>Применить</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
