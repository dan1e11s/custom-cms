'use client'

import { useState, useEffect } from 'react'
import { Plus, Pencil, Trash2, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { siteAdminApi, type FooterColumn, type FooterLink } from '@/lib/api/site'
import { toast } from '@/lib/toast'

// ─── Диалог колонки ──────────────────────────────────────────────────────────

function ColumnDialog({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean
  onClose: () => void
  onSave: (title: string) => Promise<void>
  initial?: string
}) {
  const [title, setTitle] = useState(initial ?? '')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) setTitle(initial ?? '')
  }, [open, initial])

  async function handleSave() {
    if (!title.trim()) return
    setLoading(true)
    try {
      await onSave(title.trim())
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{initial ? 'Переименовать колонку' : 'Добавить колонку'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-2">
          <Label>Название колонки</Label>
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Навигация"
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
            autoFocus
          />
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={!title.trim() || loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Диалог ссылки ────────────────────────────────────────────────────────────

function LinkDialog({
  open,
  onClose,
  onSave,
  initial,
}: {
  open: boolean
  onClose: () => void
  onSave: (data: { label: string; href: string; openInNewTab: boolean }) => Promise<void>
  initial?: FooterLink
}) {
  const [label, setLabel] = useState('')
  const [href, setHref] = useState('')
  const [openInNewTab, setOpenInNewTab] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setLabel(initial?.label ?? '')
      setHref(initial?.href ?? '')
      setOpenInNewTab(initial?.openInNewTab ?? false)
    }
  }, [open, initial])

  async function handleSave() {
    if (!label.trim() || !href.trim()) return
    setLoading(true)
    try {
      await onSave({ label: label.trim(), href: href.trim(), openInNewTab })
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{initial ? 'Редактировать ссылку' : 'Добавить ссылку'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label>Текст ссылки</Label>
            <Input
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="О нас"
              autoFocus
            />
          </div>
          <div className="space-y-1">
            <Label>URL</Label>
            <Input value={href} onChange={(e) => setHref(e.target.value)} placeholder="/about" />
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={openInNewTab}
              onChange={(e) => setOpenInNewTab(e.target.checked)}
              className="h-4 w-4"
            />
            Открывать в новой вкладке
          </label>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={onClose}>
            Отмена
          </Button>
          <Button onClick={handleSave} disabled={!label.trim() || !href.trim() || loading}>
            {loading ? 'Сохранение...' : 'Сохранить'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// ─── Карточка колонки ─────────────────────────────────────────────────────────

function ColumnCard({
  column,
  onRename,
  onDelete,
  onAddLink,
  onUpdateLink,
  onDeleteLink,
}: {
  column: FooterColumn
  onRename: (id: number, title: string) => Promise<void>
  onDelete: (id: number) => Promise<void>
  onAddLink: (
    columnId: number,
    data: { label: string; href: string; openInNewTab: boolean },
  ) => Promise<void>
  onUpdateLink: (id: number, data: Partial<FooterLink>) => Promise<void>
  onDeleteLink: (id: number) => Promise<void>
}) {
  const [renameOpen, setRenameOpen] = useState(false)
  const [addLinkOpen, setAddLinkOpen] = useState(false)
  const [editLink, setEditLink] = useState<FooterLink | null>(null)

  return (
    <div className="rounded-lg border border-border bg-card p-4 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold">{column.title}</h3>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setRenameOpen(true)}
          >
            <Pencil className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-destructive hover:text-destructive"
            onClick={() => {
              if (confirm(`Удалить колонку "${column.title}" со всеми ссылками?`))
                onDelete(column.id)
            }}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      <div className="space-y-1.5">
        {column.links.length === 0 && (
          <p className="text-xs text-muted-foreground italic">Нет ссылок</p>
        )}
        {column.links.map((link) => (
          <div
            key={link.id}
            className="flex items-center gap-2 rounded-md bg-muted/40 px-2 py-1.5 text-sm"
          >
            <span className="flex-1">{link.label}</span>
            <span className="text-xs text-muted-foreground truncate max-w-[120px]">
              {link.href}
            </span>
            {link.openInNewTab && (
              <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={() => setEditLink(link)}
            >
              <Pencil className="h-3 w-3" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0 text-destructive hover:text-destructive"
              onClick={() => {
                if (confirm(`Удалить ссылку "${link.label}"?`)) onDeleteLink(link.id)
              }}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>

      <Button variant="outline" size="sm" className="w-full" onClick={() => setAddLinkOpen(true)}>
        <Plus className="mr-2 h-3.5 w-3.5" />
        Добавить ссылку
      </Button>

      <ColumnDialog
        open={renameOpen}
        onClose={() => setRenameOpen(false)}
        onSave={(title) => onRename(column.id, title)}
        initial={column.title}
      />
      <LinkDialog
        open={addLinkOpen}
        onClose={() => setAddLinkOpen(false)}
        onSave={(data) => onAddLink(column.id, data)}
      />
      {editLink && (
        <LinkDialog
          open={true}
          onClose={() => setEditLink(null)}
          onSave={(data) => onUpdateLink(editLink.id, data)}
          initial={editLink}
        />
      )}
    </div>
  )
}

// ─── Главная страница ─────────────────────────────────────────────────────────

export default function FooterSettingsPage() {
  const [columns, setColumns] = useState<FooterColumn[]>([])
  const [loading, setLoading] = useState(true)
  const [addColumnOpen, setAddColumnOpen] = useState(false)

  useEffect(() => {
    siteAdminApi
      .getFooterColumns()
      .then(setColumns)
      .catch(() => setColumns([]))
      .finally(() => setLoading(false))
  }, [])

  async function handleAddColumn(title: string) {
    try {
      const col = await siteAdminApi.createFooterColumn({ title })
      setColumns((prev) => [...prev, { ...col, links: [] }])
      toast.success('Колонка добавлена')
    } catch {
      toast.error('Ошибка')
    }
  }

  async function handleRenameColumn(id: number, title: string) {
    try {
      await siteAdminApi.updateFooterColumn(id, { title })
      setColumns((prev) => prev.map((c) => (c.id === id ? { ...c, title } : c)))
      toast.success('Переименовано')
    } catch {
      toast.error('Ошибка')
    }
  }

  async function handleDeleteColumn(id: number) {
    try {
      await siteAdminApi.deleteFooterColumn(id)
      setColumns((prev) => prev.filter((c) => c.id !== id))
      toast.success('Колонка удалена')
    } catch {
      toast.error('Ошибка')
    }
  }

  async function handleAddLink(
    columnId: number,
    data: { label: string; href: string; openInNewTab: boolean },
  ) {
    try {
      const link = await siteAdminApi.createFooterLink({ ...data, columnId })
      setColumns((prev) =>
        prev.map((c) => (c.id === columnId ? { ...c, links: [...c.links, link] } : c)),
      )
      toast.success('Ссылка добавлена')
    } catch {
      toast.error('Ошибка')
    }
  }

  async function handleUpdateLink(id: number, data: Partial<FooterLink>) {
    try {
      const updated = await siteAdminApi.updateFooterLink(id, data)
      setColumns((prev) =>
        prev.map((c) => ({
          ...c,
          links: c.links.map((l) => (l.id === id ? { ...l, ...updated } : l)),
        })),
      )
      toast.success('Сохранено')
    } catch {
      toast.error('Ошибка')
    }
  }

  async function handleDeleteLink(id: number) {
    try {
      await siteAdminApi.deleteFooterLink(id)
      setColumns((prev) => prev.map((c) => ({ ...c, links: c.links.filter((l) => l.id !== id) })))
      toast.success('Ссылка удалена')
    } catch {
      toast.error('Ошибка')
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold">Редактор футера</h1>
          <p className="text-sm text-muted-foreground">
            Управляйте колонками и ссылками в подвале сайта.
          </p>
        </div>
        <Button onClick={() => setAddColumnOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить колонку
        </Button>
      </div>

      {columns.length === 0 ? (
        <div className="rounded-lg border border-dashed border-border py-12 text-center text-sm text-muted-foreground">
          Нет колонок футера. Добавьте первую.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {columns.map((column) => (
            <ColumnCard
              key={column.id}
              column={column}
              onRename={handleRenameColumn}
              onDelete={handleDeleteColumn}
              onAddLink={handleAddLink}
              onUpdateLink={handleUpdateLink}
              onDeleteLink={handleDeleteLink}
            />
          ))}
        </div>
      )}

      <ColumnDialog
        open={addColumnOpen}
        onClose={() => setAddColumnOpen(false)}
        onSave={handleAddColumn}
      />
    </div>
  )
}
