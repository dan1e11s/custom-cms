'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, ImageIcon, Loader2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { mediaApi } from '@/lib/api/media'
import type { MediaItem } from '@/lib/api/media'
import { cn } from '@/lib/utils'

interface MediaPickerProps {
  value: string
  onChange: (url: string) => void
  placeholder?: string
}

// ── Мини-сетка внутри диалога ─────────────────────────────────────────────────

function MediaGrid({ selected, onSelect }: { selected: string; onSelect: (url: string) => void }) {
  const [items, setItems] = useState<MediaItem[]>([])
  const [page, setPage] = useState(1)
  const [pages, setPages] = useState(1)
  const [loading, setLoading] = useState(true)
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const data = await mediaApi.getAll(p, 18)
      setItems((prev) => (p === 1 ? data.items : [...prev, ...data.items]))
      setPages(data.pages)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(1)
  }, [load])

  const handleUpload = async (files: FileList | null) => {
    if (!files || files.length === 0) return
    setUploading(true)
    try {
      const uploaded = await mediaApi.upload(files[0])
      setItems((prev) => [uploaded, ...prev])
      onSelect(uploaded.url)
    } catch {
      /* ignore */
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    load(next)
  }

  return (
    <div className="space-y-3">
      {/* Кнопка загрузки */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
        >
          {uploading ? (
            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
          ) : (
            <Upload className="mr-1.5 h-3.5 w-3.5" />
          )}
          Загрузить файл
        </Button>
        <span className="text-xs text-muted-foreground">или выберите из галереи</span>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => handleUpload(e.target.files)}
        />
      </div>

      {/* Сетка */}
      {loading && items.length === 0 ? (
        <div className="flex h-40 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
          Медиатека пуста. Загрузите первый файл.
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-6">
            {items.map((item) => {
              const isSelected = item.url === selected
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelect(item.url)}
                  className={cn(
                    'relative aspect-square overflow-hidden rounded-lg border-2 transition-all',
                    isSelected
                      ? 'border-primary shadow-md'
                      : 'border-transparent hover:border-primary/40',
                  )}
                >
                  <img
                    src={item.url}
                    alt={item.alt ?? item.originalName}
                    className="h-full w-full object-cover"
                  />
                  {isSelected && (
                    <div className="absolute inset-0 flex items-center justify-center bg-primary/20">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary">
                        <Check className="h-3.5 w-3.5 text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </button>
              )
            })}
          </div>

          {page < pages && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="w-full"
              onClick={loadMore}
              disabled={loading}
            >
              {loading ? <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" /> : null}
              Загрузить ещё
            </Button>
          )}
        </>
      )}
    </div>
  )
}

// ── Основной компонент ────────────────────────────────────────────────────────

export function MediaPicker({ value, onChange, placeholder }: MediaPickerProps) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<'gallery' | 'url'>('gallery')
  const [urlInput, setUrlInput] = useState('')
  const [pending, setPending] = useState(value)

  const handleOpen = () => {
    setPending(value)
    setUrlInput(value)
    setOpen(true)
  }

  const handleApply = () => {
    const final = tab === 'url' ? urlInput : pending
    if (final) onChange(final)
    setOpen(false)
  }

  const handleSelectFromGallery = (url: string) => {
    setPending(url)
  }

  return (
    <div className="space-y-2">
      {/* Поле + кнопка */}
      <div className="flex gap-2">
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder ?? 'URL или выберите из медиатеки'}
          className="flex-1 text-sm"
        />
        <Button type="button" variant="outline" size="icon" onClick={handleOpen} title="Медиатека">
          <ImageIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Превью */}
      {value && (
        <div className="relative h-28 w-full overflow-hidden rounded-lg border bg-muted">
          <img src={value} alt="" className="h-full w-full object-cover" />
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute right-1.5 top-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-background/80 text-foreground hover:bg-background"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Диалог */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Медиатека</DialogTitle>
          </DialogHeader>

          {/* Табы */}
          <div className="flex gap-1 rounded-lg bg-muted p-1 w-fit">
            {(['gallery', 'url'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={cn(
                  'rounded-md px-3 py-1 text-sm font-medium transition-colors',
                  tab === t
                    ? 'bg-background shadow-sm'
                    : 'text-muted-foreground hover:text-foreground',
                )}
              >
                {t === 'gallery' ? '🖼 Галерея' : '🔗 URL'}
              </button>
            ))}
          </div>

          {/* Контент таба */}
          <div className="max-h-[400px] overflow-y-auto pr-1">
            {tab === 'gallery' ? (
              <MediaGrid selected={pending} onSelect={handleSelectFromGallery} />
            ) : (
              <div className="space-y-2 pt-2">
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  autoFocus
                  onKeyDown={(e) => e.key === 'Enter' && handleApply()}
                />
                {urlInput && (
                  <div className="h-32 overflow-hidden rounded-lg border bg-muted">
                    <img src={urlInput} alt="" className="h-full w-full object-contain" />
                  </div>
                )}
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button type="button" onClick={handleApply}>
              {tab === 'gallery' && pending ? 'Выбрать' : 'Применить'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
