'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  ChevronDown,
  ChevronRight,
  Edit2,
  ExternalLink,
  GripVertical,
  Lock,
  LockOpen,
  Loader2,
  MessageSquare,
  Pin,
  PinOff,
  Plus,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { forumApi, forumAdminApi } from '@/lib/api/forum'
import type { ForumSection, ForumThread, ForumThreadsResponse } from '@/types/forum'

// ── Форма раздела ─────────────────────────────────────────────────────────────

interface SectionForm {
  title: string
  slug: string
  description: string
  order: string
}

const EMPTY_FORM: SectionForm = { title: '', slug: '', description: '', order: '0' }

function slugify(text: string): string {
  const map: Record<string, string> = {
    а: 'a',
    б: 'b',
    в: 'v',
    г: 'g',
    д: 'd',
    е: 'e',
    ё: 'yo',
    ж: 'zh',
    з: 'z',
    и: 'i',
    й: 'j',
    к: 'k',
    л: 'l',
    м: 'm',
    н: 'n',
    о: 'o',
    п: 'p',
    р: 'r',
    с: 's',
    т: 't',
    у: 'u',
    ф: 'f',
    х: 'kh',
    ц: 'ts',
    ч: 'ch',
    ш: 'sh',
    щ: 'shch',
    ъ: '',
    ы: 'y',
    ь: '',
    э: 'e',
    ю: 'yu',
    я: 'ya',
  }
  return text
    .toLowerCase()
    .replace(/[а-яё]/g, (c) => map[c] ?? c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── Главная страница ──────────────────────────────────────────────────────────

export default function AdminForumPage() {
  const [sections, setSections] = useState<ForumSection[]>([])
  const [loading, setLoading] = useState(true)

  // Expanded section → threads
  const [expandedId, setExpandedId] = useState<number | null>(null)
  const [threads, setThreads] = useState<Record<number, ForumThread[]>>({})
  const [threadsLoading, setThreadsLoading] = useState<number | null>(null)

  // Диалог создания/редактирования раздела
  const [sectionDialog, setSectionDialog] = useState<{
    open: boolean
    editing: ForumSection | null
  }>({ open: false, editing: null })
  const [form, setForm] = useState<SectionForm>(EMPTY_FORM)
  const [saving, setSaving] = useState(false)

  // Диалог удаления
  const [deleteSection, setDeleteSection] = useState<ForumSection | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [deleteThread, setDeleteThread] = useState<ForumThread | null>(null)
  const [deletingThread, setDeletingThread] = useState(false)

  // ── Загрузка разделов ──────────────────────────────────────────────────────

  const loadSections = useCallback(async () => {
    setLoading(true)
    try {
      setSections(await forumApi.getSections())
    } catch {
      setSections([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadSections()
  }, [loadSections])

  // ── Раскрытие раздела → загрузка тем ──────────────────────────────────────

  const toggleSection = async (section: ForumSection) => {
    if (expandedId === section.id) {
      setExpandedId(null)
      return
    }
    setExpandedId(section.id)
    if (threads[section.id]) return // уже загружены

    setThreadsLoading(section.id)
    try {
      const data: ForumThreadsResponse = await forumApi.getThreads(section.slug, 1, 50)
      setThreads((prev) => ({ ...prev, [section.id]: data.items }))
    } catch {
      setThreads((prev) => ({ ...prev, [section.id]: [] }))
    } finally {
      setThreadsLoading(null)
    }
  }

  // ── Диалог раздела ────────────────────────────────────────────────────────

  const openCreate = () => {
    setForm(EMPTY_FORM)
    setSectionDialog({ open: true, editing: null })
  }

  const openEdit = (s: ForumSection) => {
    setForm({
      title: s.title,
      slug: s.slug,
      description: s.description ?? '',
      order: String(s.order),
    })
    setSectionDialog({ open: true, editing: s })
  }

  const handleTitleChange = (value: string) => {
    setForm((prev) => ({
      ...prev,
      title: value,
      // Автогенерация slug только при создании и если slug не редактировался вручную
      ...(sectionDialog.editing ? {} : { slug: slugify(value) }),
    }))
  }

  const handleSaveSection = async () => {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      const payload = {
        title: form.title.trim(),
        slug: form.slug.trim() || slugify(form.title),
        description: form.description.trim() || undefined,
        order: Number(form.order) || 0,
      }
      if (sectionDialog.editing) {
        const updated = await forumAdminApi.updateSection(sectionDialog.editing.id, payload)
        setSections((prev) => prev.map((s) => (s.id === updated.id ? { ...s, ...updated } : s)))
      } else {
        const created = await forumAdminApi.createSection(payload)
        setSections((prev) => [...prev, { ...created, _count: { threads: 0 } }])
      }
      setSectionDialog({ open: false, editing: null })
    } catch {
      // ignore
    } finally {
      setSaving(false)
    }
  }

  // ── Удаление раздела ──────────────────────────────────────────────────────

  const handleDeleteSection = async () => {
    if (!deleteSection) return
    setDeleting(true)
    try {
      await forumAdminApi.deleteSection(deleteSection.id)
      setSections((prev) => prev.filter((s) => s.id !== deleteSection.id))
      setDeleteSection(null)
      if (expandedId === deleteSection.id) setExpandedId(null)
    } catch {
      // ignore
    } finally {
      setDeleting(false)
    }
  }

  // ── Pin / Lock темы ───────────────────────────────────────────────────────

  const handlePinLock = async (thread: ForumThread, field: 'isPinned' | 'isLocked') => {
    try {
      const updated = await forumAdminApi.pinLockThread(thread.id, {
        [field]: !thread[field],
      })
      setThreads((prev) => ({
        ...prev,
        [thread.section.id]: (prev[thread.section.id] ?? []).map((t) =>
          t.id === updated.id ? updated : t,
        ),
      }))
    } catch {
      // ignore
    }
  }

  // ── Удаление темы ─────────────────────────────────────────────────────────

  const handleDeleteThread = async () => {
    if (!deleteThread) return
    setDeletingThread(true)
    try {
      await forumAdminApi.deleteThread(deleteThread.id)
      const sId = deleteThread.section.id
      setThreads((prev) => ({
        ...prev,
        [sId]: (prev[sId] ?? []).filter((t) => t.id !== deleteThread.id),
      }))
      setSections((prev) =>
        prev.map((s) =>
          s.id === sId ? { ...s, _count: { threads: Math.max(0, s._count.threads - 1) } } : s,
        ),
      )
      setDeleteThread(null)
    } catch {
      // ignore
    } finally {
      setDeletingThread(false)
    }
  }

  // ── Рендер ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* Шапка */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Форум</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">Управление разделами и темами</p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="h-4 w-4" />
          Новый раздел
        </Button>
      </div>

      {/* Список разделов */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : sections.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/10 py-20 text-muted-foreground">
          <MessageSquare className="mb-4 h-12 w-12 opacity-25" />
          <p className="font-medium">Разделов пока нет</p>
          <Button className="mt-4" onClick={openCreate}>
            <Plus className="h-4 w-4" />
            Создать первый раздел
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {sections
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((section) => (
              <SectionRow
                key={section.id}
                section={section}
                expanded={expandedId === section.id}
                threads={threads[section.id]}
                threadsLoading={threadsLoading === section.id}
                onToggle={() => toggleSection(section)}
                onEdit={() => openEdit(section)}
                onDelete={() => setDeleteSection(section)}
                onPinLock={handlePinLock}
                onDeleteThread={setDeleteThread}
              />
            ))}
        </div>
      )}

      {/* ── Диалог создания / редактирования раздела ── */}
      <Dialog
        open={sectionDialog.open}
        onOpenChange={(v) => !v && setSectionDialog({ open: false, editing: null })}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {sectionDialog.editing ? 'Редактировать раздел' : 'Новый раздел'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4 py-2">
            <div className="space-y-1.5">
              <Label>Название</Label>
              <Input
                value={form.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Общие вопросы"
                autoFocus
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Slug{' '}
                <span className="text-xs font-normal text-muted-foreground">
                  (URL-идентификатор)
                </span>
              </Label>
              <Input
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                placeholder="obshchie-voprosy"
              />
            </div>

            <div className="space-y-1.5">
              <Label>Описание</Label>
              <Textarea
                value={form.description}
                onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Кратко о чём этот раздел…"
                className="resize-none"
                rows={2}
              />
            </div>

            <div className="space-y-1.5">
              <Label>
                Порядок{' '}
                <span className="text-xs font-normal text-muted-foreground">(меньше = выше)</span>
              </Label>
              <Input
                type="number"
                min={0}
                value={form.order}
                onChange={(e) => setForm((prev) => ({ ...prev, order: e.target.value }))}
                className="w-24"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setSectionDialog({ open: false, editing: null })}
            >
              Отмена
            </Button>
            <Button onClick={handleSaveSection} disabled={saving || !form.title.trim()}>
              {saving && <Loader2 className="h-4 w-4 animate-spin" />}
              {sectionDialog.editing ? 'Сохранить' : 'Создать'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Диалог удаления раздела ── */}
      <Dialog open={!!deleteSection} onOpenChange={(v) => !v && setDeleteSection(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Удалить раздел?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Раздел <span className="font-medium text-foreground">«{deleteSection?.title}»</span> и
            все его темы будут удалены. Это действие нельзя отменить.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteSection(null)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteSection} disabled={deleting}>
              {deleting && <Loader2 className="h-4 w-4 animate-spin" />}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Диалог удаления темы ── */}
      <Dialog open={!!deleteThread} onOpenChange={(v) => !v && setDeleteThread(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Удалить тему?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Тема <span className="font-medium text-foreground">«{deleteThread?.title}»</span> и все
            её сообщения будут удалены. Это действие нельзя отменить.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteThread(null)}>
              Отмена
            </Button>
            <Button variant="destructive" onClick={handleDeleteThread} disabled={deletingThread}>
              {deletingThread && <Loader2 className="h-4 w-4 animate-spin" />}
              Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Строка раздела с вложенными темами ────────────────────────────────────────

interface SectionRowProps {
  section: ForumSection
  expanded: boolean
  threads?: ForumThread[]
  threadsLoading: boolean
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
  onPinLock: (thread: ForumThread, field: 'isPinned' | 'isLocked') => void
  onDeleteThread: (thread: ForumThread) => void
}

function SectionRow({
  section,
  expanded,
  threads,
  threadsLoading,
  onToggle,
  onEdit,
  onDelete,
  onPinLock,
  onDeleteThread,
}: SectionRowProps) {
  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Шапка раздела */}
      <div className="flex items-center gap-3 px-4 py-3">
        <GripVertical className="h-4 w-4 flex-shrink-0 text-muted-foreground/40" />

        <button onClick={onToggle} className="flex flex-1 items-center gap-2 text-left min-w-0">
          {expanded ? (
            <ChevronDown className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          ) : (
            <ChevronRight className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
          )}
          <div className="min-w-0 flex-1">
            <span className="font-semibold">{section.title}</span>
            {section.description && (
              <span className="ml-2 text-xs text-muted-foreground">{section.description}</span>
            )}
          </div>
          <span className="ml-2 flex-shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
            {section._count.threads} тем
          </span>
        </button>

        <div className="flex flex-shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Смотреть на сайте" asChild>
            <Link href={`/forum/${section.slug}`} target="_blank">
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            title="Редактировать"
            onClick={onEdit}
          >
            <Edit2 className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 hover:text-destructive"
            title="Удалить раздел"
            onClick={onDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>

      {/* Список тем */}
      {expanded && (
        <div className="border-t">
          {threadsLoading ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
            </div>
          ) : !threads || threads.length === 0 ? (
            <p className="px-6 py-4 text-sm text-muted-foreground">Тем пока нет</p>
          ) : (
            <table className="w-full text-sm">
              <tbody>
                {threads.map((thread) => (
                  <tr
                    key={thread.id}
                    className="border-b last:border-0 transition-colors hover:bg-muted/20"
                  >
                    <td className="py-2.5 pl-10 pr-2">
                      <div className="flex items-center gap-1.5">
                        {thread.isPinned && <Pin className="h-3 w-3 flex-shrink-0 text-primary" />}
                        {thread.isLocked && (
                          <Lock className="h-3 w-3 flex-shrink-0 text-muted-foreground" />
                        )}
                        <Link
                          href={`/forum/${section.slug}/${thread.slug}`}
                          target="_blank"
                          className="line-clamp-1 hover:text-primary"
                        >
                          {thread.title}
                        </Link>
                      </div>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        @{thread.author.username} · {thread._count.posts} сообщ.
                      </p>
                    </td>
                    <td className="py-2.5 pr-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title={thread.isPinned ? 'Открепить' : 'Закрепить'}
                          onClick={() => onPinLock(thread, 'isPinned')}
                        >
                          {thread.isPinned ? (
                            <PinOff className="h-3.5 w-3.5" />
                          ) : (
                            <Pin className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          title={thread.isLocked ? 'Открыть' : 'Закрыть'}
                          onClick={() => onPinLock(thread, 'isLocked')}
                        >
                          {thread.isLocked ? (
                            <LockOpen className="h-3.5 w-3.5" />
                          ) : (
                            <Lock className="h-3.5 w-3.5" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 hover:text-destructive"
                          title="Удалить тему"
                          onClick={() => onDeleteThread(thread)}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
