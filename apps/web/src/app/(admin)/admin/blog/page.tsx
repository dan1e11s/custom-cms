'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Edit2,
  Trash2,
  Globe,
  Globe2,
  Clock,
  Eye,
  Loader2,
  FileText,
  Search,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { blogApi } from '@/lib/api/blog'
import type { BlogPost, BlogListResponse } from '@/types/blog'

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

function formatDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function AdminBlogPage() {
  const router = useRouter()
  const [data, setData] = useState<BlogListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  const [createOpen, setCreateOpen] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [creating, setCreating] = useState(false)

  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const [scheduleId, setScheduleId] = useState<number | null>(null)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduling, setScheduling] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await blogApi.getAllPosts({ search, limit: 50 }))
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [search])

  useEffect(() => {
    load()
  }, [load])

  const handleCreate = async () => {
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const post = await blogApi.createPost({ title: newTitle.trim(), content: '' })
      router.push(`/admin/blog/posts/${post.id}`)
    } catch {
      setCreating(false)
    }
  }

  const handlePublish = async (p: BlogPost) => {
    try {
      if (p.status === 'PUBLISHED') await blogApi.unpublishPost(p.id)
      else await blogApi.publishPost(p.id)
      load()
    } catch {
      /* ignore */
    }
  }

  const handleDelete = async (id: number) => {
    setDeleting(true)
    try {
      await blogApi.deletePost(id)
      setDeleteId(null)
      load()
    } finally {
      setDeleting(false)
    }
  }

  const handleSchedule = async () => {
    if (!scheduleId || !scheduleDate) return
    setScheduling(true)
    try {
      await blogApi.schedulePost(scheduleId, new Date(scheduleDate).toISOString())
      setScheduleId(null)
      setScheduleDate('')
      load()
    } finally {
      setScheduling(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Блог</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Статьи и публикации</p>
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Новая статья
        </Button>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по заголовку..."
          className="pl-9"
        />
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !data?.items.length ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/10 py-20 text-muted-foreground">
          <FileText className="mb-4 h-12 w-12 opacity-25" />
          <p className="font-medium">Статей пока нет</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Написать первую статью
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                {['Заголовок', 'Статус', 'Публикация', 'Просмотры', ''].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.items.map((p) => (
                <tr
                  key={p.id}
                  className="border-b last:border-0 transition-colors hover:bg-muted/20"
                >
                  <td className="px-4 py-3">
                    <button
                      onClick={() => router.push(`/admin/blog/posts/${p.id}`)}
                      className="font-medium hover:text-primary text-left"
                    >
                      {p.title}
                    </button>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="font-mono text-xs text-muted-foreground">/{p.slug}</span>
                      {p.tags.map((t) => (
                        <span
                          key={t.id}
                          className="rounded-full border px-1.5 py-0 text-xs text-muted-foreground"
                        >
                          #{t.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[p.status] ?? 'secondary'}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {p.publishedAt ? formatDate(p.publishedAt) : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Eye className="h-3.5 w-3.5" />
                      {p.views}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Редактировать"
                        onClick={() => router.push(`/admin/blog/posts/${p.id}`)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title={p.status === 'PUBLISHED' ? 'Снять с публикации' : 'Опубликовать'}
                        onClick={() => handlePublish(p)}
                      >
                        {p.status === 'PUBLISHED' ? (
                          <Globe2 className="h-3.5 w-3.5" />
                        ) : (
                          <Globe className="h-3.5 w-3.5" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Запланировать"
                        onClick={() => {
                          setScheduleId(p.id)
                          setScheduleDate('')
                        }}
                      >
                        <Clock className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:text-destructive"
                        title="Удалить"
                        onClick={() => setDeleteId(p.id)}
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
            <div className="border-t px-4 py-2 text-center text-xs text-muted-foreground">
              Показано {data.items.length} из {data.total}
            </div>
          )}
        </div>
      )}

      {/* Создать статью */}
      <Dialog
        open={createOpen}
        onOpenChange={(v) => {
          setCreateOpen(v)
          if (!v) setNewTitle('')
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Новая статья</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Заголовок статьи"
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
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Создать и открыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Запланировать */}
      <Dialog open={scheduleId !== null} onOpenChange={(v) => !v && setScheduleId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Запланировать публикацию</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Дата и время публикации</Label>
            <Input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleId(null)}>
              Отмена
            </Button>
            <Button onClick={handleSchedule} disabled={scheduling || !scheduleDate}>
              {scheduling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Запланировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Удалить */}
      <Dialog open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Удалить статью?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">Это действие нельзя отменить.</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteId(null)}>
              Отмена
            </Button>
            <Button
              variant="destructive"
              onClick={() => deleteId && handleDelete(deleteId)}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
