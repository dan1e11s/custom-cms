'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Edit2, Trash2, Copy, Globe, FileText } from 'lucide-react'
import { pagesApi } from '@/lib/api/pages'
import type { Page, PagesListResponse } from '@/types/pages'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Черновик',
  PUBLISHED: 'Опубликована',
  ARCHIVED: 'Архив',
}

const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  DRAFT: 'secondary',
  PUBLISHED: 'default',
  ARCHIVED: 'outline',
}

export default function AdminPagesPage() {
  const router = useRouter()

  const [data, setData] = useState<PagesListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  // Создание страницы
  const [createOpen, setCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)

  // Подтверждение удаления
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  async function loadPages() {
    setLoading(true)
    try {
      const res = await pagesApi.list({ search, limit: 50 })
      setData(res)
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadPages()
  }, [search]) // eslint-disable-line react-hooks/exhaustive-deps

  async function handleCreate() {
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const page = await pagesApi.create({ title: newTitle.trim() })
      router.push(`/pages/${page.id}`)
    } catch {
      setCreating(false)
    }
  }

  async function handleDelete(id: number) {
    setDeleting(true)
    try {
      await pagesApi.delete(id)
      setDeleteId(null)
      loadPages()
    } finally {
      setDeleting(false)
    }
  }

  async function handleDuplicate(id: number) {
    try {
      await pagesApi.duplicate(id)
      loadPages()
    } catch {
      // ignore
    }
  }

  async function handlePublish(page: Page) {
    try {
      if (page.status === 'PUBLISHED') {
        await pagesApi.update(page.id, { status: 'DRAFT' })
      } else {
        await pagesApi.publish(page.id)
      }
      loadPages()
    } catch {
      // ignore
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Страницы</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Лендинги и страницы сайта</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Создать страницу
        </Button>
      </div>

      <Input
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Поиск по названию или slug..."
        className="max-w-sm"
      />

      {loading ? (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      ) : !data || data.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-muted-foreground border rounded-lg bg-muted/10">
          <FileText className="h-12 w-12 mb-4 opacity-25" />
          <p className="font-medium">Страниц пока нет</p>
          <p className="text-sm mt-1 opacity-70">Создайте первую страницу</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Создать страницу
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border bg-background overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Название</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Slug</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Статус</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Обновлено</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {data.items.map((page) => (
                <tr
                  key={page.id}
                  className="border-b last:border-0 hover:bg-muted/20 transition-colors"
                >
                  <td className="px-4 py-3">
                    <button
                      type="button"
                      className="font-medium hover:text-primary transition-colors text-left"
                      onClick={() => router.push(`/pages/${page.id}`)}
                    >
                      {page.title}
                    </button>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                    /{page.slug}
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[page.status] ?? 'secondary'}>
                      {STATUS_LABEL[page.status] ?? page.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(page.updatedAt).toLocaleDateString('ru-RU', {
                      day: '2-digit',
                      month: '2-digit',
                      year: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Редактировать"
                        onClick={() => router.push(`/pages/${page.id}`)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title={page.status === 'PUBLISHED' ? 'Снять с публикации' : 'Опубликовать'}
                        onClick={() => handlePublish(page)}
                      >
                        <Globe className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Дублировать"
                        onClick={() => handleDuplicate(page.id)}
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-destructive"
                        title="Удалить"
                        onClick={() => setDeleteId(page.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {data.total > data.items.length && (
            <div className="border-t px-4 py-2 text-xs text-muted-foreground text-center">
              Показано {data.items.length} из {data.total}
            </div>
          )}
        </div>
      )}

      {/* ─── Диалог создания страницы ────────────────────────────────────────── */}
      <Dialog
        open={createOpen}
        onOpenChange={(v) => {
          setCreateOpen(v)
          if (!v) setNewTitle('')
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Новая страница</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Название страницы"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <p className="text-xs text-muted-foreground">Slug будет сгенерирован автоматически</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreate} disabled={creating || !newTitle.trim()}>
              {creating && <Spinner size="sm" className="mr-2" />}
              Создать и открыть редактор
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Диалог подтверждения удаления ───────────────────────────────────── */}
      <Dialog open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Удалить страницу?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Это действие нельзя отменить. Страница и все её блоки будут удалены.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={deleting}
            >
              {deleting && <Spinner size="sm" className="mr-2" />}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
