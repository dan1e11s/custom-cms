'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Check, Copy, Loader2, Pencil, Trash2, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { mediaApi } from '@/lib/api/media'
import type { MediaItem } from '@/lib/api/media'
import { cn } from '@/lib/utils'

function formatSize(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// ── Карточка файла ────────────────────────────────────────────────────────────

function MediaCard({
  item,
  onDelete,
  onAltSave,
}: {
  item: MediaItem
  onDelete: (id: number) => void
  onAltSave: (id: number, alt: string) => void
}) {
  const [editingAlt, setEditingAlt] = useState(false)
  const [altValue, setAltValue] = useState(item.alt ?? '')
  const [copied, setCopied] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [savingAlt, setSavingAlt] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(item.url)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const handleDelete = async () => {
    if (!confirm('Удалить файл? Это действие нельзя отменить.')) return
    setDeleting(true)
    try {
      await mediaApi.delete(item.id)
      onDelete(item.id)
    } catch {
      setDeleting(false)
    }
  }

  const handleAltSave = async () => {
    setSavingAlt(true)
    try {
      await mediaApi.updateAlt(item.id, altValue)
      onAltSave(item.id, altValue)
      setEditingAlt(false)
    } catch {
      /* ignore */
    } finally {
      setSavingAlt(false)
    }
  }

  return (
    <div className="group relative rounded-xl overflow-hidden border border-border bg-card">
      {/* Превью */}
      <div className="relative aspect-video bg-muted/50">
        <img
          src={item.url}
          alt={item.alt ?? item.originalName}
          className="h-full w-full object-cover"
        />

        {/* Оверлей с действиями */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={handleCopy}
            title="Скопировать URL"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-800 hover:bg-white"
          >
            {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
          </button>
          <button
            onClick={() => setEditingAlt(true)}
            title="Редактировать ALT"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-gray-800 hover:bg-white"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            onClick={handleDelete}
            disabled={deleting}
            title="Удалить"
            className="flex h-8 w-8 items-center justify-center rounded-full bg-red-500/90 text-white hover:bg-red-500"
          >
            {deleting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Мета */}
      <div className="p-2.5 space-y-1">
        {editingAlt ? (
          <div className="flex gap-1">
            <Input
              value={altValue}
              onChange={(e) => setAltValue(e.target.value)}
              placeholder="ALT-текст"
              className="h-7 text-xs"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleAltSave()
                if (e.key === 'Escape') setEditingAlt(false)
              }}
            />
            <button
              onClick={handleAltSave}
              disabled={savingAlt}
              className="rounded bg-primary px-1.5 text-primary-foreground"
            >
              {savingAlt ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </button>
            <button onClick={() => setEditingAlt(false)} className="rounded bg-muted px-1.5">
              <X className="h-3 w-3" />
            </button>
          </div>
        ) : (
          <p className="truncate text-xs font-medium" title={item.originalName}>
            {item.originalName}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground">{formatSize(item.size)}</p>
      </div>
    </div>
  )
}

// ── Зона загрузки ─────────────────────────────────────────────────────────────

function DropZone({ onUploaded }: { onUploaded: (item: MediaItem) => void }) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [dragging, setDragging] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFiles = useCallback(
    async (files: FileList | null) => {
      if (!files || files.length === 0) return
      setError(null)
      setUploading(true)
      try {
        for (const file of Array.from(files)) {
          const item = await mediaApi.upload(file)
          onUploaded(item)
        }
      } catch (e: unknown) {
        setError(e instanceof Error ? e.message : 'Ошибка загрузки')
      } finally {
        setUploading(false)
      }
    },
    [onUploaded],
  )

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault()
        setDragging(true)
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault()
        setDragging(false)
        handleFiles(e.dataTransfer.files)
      }}
      onClick={() => fileRef.current?.click()}
      className={cn(
        'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed py-10 transition-colors',
        dragging
          ? 'border-primary bg-primary/5'
          : 'border-border hover:border-primary/50 hover:bg-muted/50',
      )}
    >
      {uploading ? (
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      ) : (
        <Upload className="h-8 w-8 text-muted-foreground" />
      )}
      <p className="text-sm text-muted-foreground">
        {uploading ? 'Загрузка...' : 'Перетащите файлы или нажмите для выбора'}
      </p>
      <p className="text-xs text-muted-foreground">JPEG, PNG, WEBP, GIF — до 10 МБ</p>
      {error && <p className="text-xs text-destructive">{error}</p>}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  )
}

// ── Главная страница ──────────────────────────────────────────────────────────

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaItem[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const LIMIT = 24

  const load = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const data = await mediaApi.getAll(p, LIMIT)
      setItems(data.items)
      setTotal(data.total)
      setPages(data.pages)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load(page)
  }, [load, page])

  const handleUploaded = (item: MediaItem) => {
    setItems((prev) => [item, ...prev])
    setTotal((t) => t + 1)
  }

  const handleDelete = (id: number) => {
    setItems((prev) => prev.filter((m) => m.id !== id))
    setTotal((t) => t - 1)
  }

  const handleAltSave = (id: number, alt: string) => {
    setItems((prev) => prev.map((m) => (m.id === id ? { ...m, alt } : m)))
  }

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Медиатека</h1>
          <p className="text-sm text-muted-foreground">{total} файлов</p>
        </div>
      </div>

      {/* Дроп-зона */}
      <DropZone onUploaded={handleUploaded} />

      {/* Сетка файлов */}
      {loading ? (
        <div className="flex h-40 items-center justify-center text-muted-foreground">
          <Loader2 className="h-6 w-6 animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground">Файлов пока нет</div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {items.map((item) => (
            <MediaCard
              key={item.id}
              item={item}
              onDelete={handleDelete}
              onAltSave={handleAltSave}
            />
          ))}
        </div>
      )}

      {/* Пагинация */}
      {pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
          >
            ← Назад
          </Button>
          <span className="text-sm text-muted-foreground">
            {page} / {pages}
          </span>
          <Button
            size="sm"
            variant="outline"
            disabled={page === pages}
            onClick={() => setPage((p) => p + 1)}
          >
            Вперёд →
          </Button>
        </div>
      )}
    </div>
  )
}
