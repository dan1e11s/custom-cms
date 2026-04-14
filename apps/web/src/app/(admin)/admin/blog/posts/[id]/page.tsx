'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Globe, Globe2, Clock, Loader2, X } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RichTextEditor } from '@/components/admin/page-editor/RichTextEditor'
import { MediaPicker } from '@/components/admin/page-editor/MediaPicker'
import { blogApi } from '@/lib/api/blog'
import { catalogApi } from '@/lib/api/catalog'
import type { BlogPost, BlogCategory } from '@/types/blog'
import type { Category } from '@/types/catalog'

const schema = z.object({
  title: z.string().min(1, 'Обязательное поле').max(300),
  slug: z.string().max(300).optional(),
  excerpt: z.string().max(500).optional(),
  coverImage: z.string().url('Некорректный URL').or(z.literal('')).optional(),
  categoryId: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z.number().positive().optional(),
  ),
  seoTitle: z.string().max(200).optional(),
  seoDesc: z.string().max(400).optional(),
})

type FormData = z.infer<typeof schema>
interface Props {
  params: { id: string }
}

export default function PostEditorPage({ params }: Props) {
  const router = useRouter()
  const id = Number(params.id)

  const [post, setPost] = useState<BlogPost | null>(null)
  const [categories, setCategories] = useState<BlogCategory[]>([])
  const [content, setContent] = useState('')
  const [tagInput, setTagInput] = useState('')
  const [tags, setTags] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [error, setError] = useState('')
  const [scheduleOpen, setScheduleOpen] = useState(false)
  const [scheduleDate, setScheduleDate] = useState('')
  const [scheduling, setScheduling] = useState(false)

  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    Promise.all([blogApi.getPostById(id), catalogApi.getCategoryTree()])
      .then(([p, tree]) => {
        setPost(p)
        setCategories(flattenTree(tree) as unknown as BlogCategory[])
        setContent(p.content)
        setTags(p.tags.map((t) => t.name))
        form.reset({
          title: p.title,
          slug: p.slug,
          excerpt: p.excerpt ?? '',
          coverImage: p.coverImage ?? '',
          categoryId: p.categoryId ?? undefined,
          seoTitle: p.seoTitle ?? '',
          seoDesc: p.seoDesc ?? '',
        })
      })
      .catch((e) => setError(e.message ?? 'Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const addTag = () => {
    const t = tagInput.trim()
    if (t && !tags.includes(t)) setTags((p) => [...p, t])
    setTagInput('')
  }

  const handleSave = async (data: FormData) => {
    setSaving(true)
    setSavedMsg('')
    setError('')
    try {
      const updated = await blogApi.updatePost(id, {
        title: data.title,
        slug: data.slug || undefined,
        excerpt: data.excerpt || undefined,
        content,
        coverImage: data.coverImage || undefined,
        categoryId: data.categoryId ?? undefined,
        tags,
        seoTitle: data.seoTitle || undefined,
        seoDesc: data.seoDesc || undefined,
      })
      setPost(updated)
      setSavedMsg('Сохранено')
      setTimeout(() => setSavedMsg(''), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!post) return
    try {
      const updated =
        post.status === 'PUBLISHED'
          ? await blogApi.unpublishPost(id)
          : await blogApi.publishPost(id)
      setPost(updated)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    }
  }

  const handleSchedule = async () => {
    if (!scheduleDate) return
    setScheduling(true)
    try {
      const updated = await blogApi.schedulePost(id, new Date(scheduleDate).toISOString())
      setPost(updated)
      setScheduleOpen(false)
      setScheduleDate('')
    } finally {
      setScheduling(false)
    }
  }

  if (loading)
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  if (!post)
    return (
      <div className="py-20 text-center text-muted-foreground">{error || 'Статья не найдена'}</div>
    )

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Шапка */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/blog')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold line-clamp-1">{post.title}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge
                variant={post.status === 'PUBLISHED' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {post.status === 'PUBLISHED' ? 'Опубликована' : 'Черновик'}
              </Badge>
              {post.publishedAt && post.status === 'DRAFT' && (
                <span className="text-xs text-muted-foreground">
                  Запланирована: {new Date(post.publishedAt).toLocaleString('ru-RU')}
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setScheduleOpen(true)}>
            <Clock className="mr-1.5 h-4 w-4" />
            Запланировать
          </Button>
          <Button variant="outline" onClick={handlePublish}>
            {post.status === 'PUBLISHED' ? (
              <>
                <Globe2 className="mr-2 h-4 w-4" />
                Снять
              </>
            ) : (
              <>
                <Globe className="mr-2 h-4 w-4" />
                Опубликовать
              </>
            )}
          </Button>
          <Button onClick={form.handleSubmit(handleSave)} disabled={saving}>
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Сохранить
          </Button>
        </div>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {savedMsg && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          ✓ {savedMsg}
        </div>
      )}

      <form onSubmit={form.handleSubmit(handleSave)} className="space-y-6">
        {/* Основное */}
        <section className="rounded-lg border p-5 space-y-4">
          <h2 className="font-semibold">Основное</h2>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 space-y-1.5">
              <Label>Заголовок *</Label>
              <Input {...form.register('title')} placeholder="Заголовок статьи" />
              {form.formState.errors.title && (
                <p className="text-xs text-red-500">{form.formState.errors.title.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label>
                Slug <span className="text-muted-foreground text-xs">(авто)</span>
              </Label>
              <Input {...form.register('slug')} placeholder="auto-generated" />
            </div>
            <div className="space-y-1.5">
              <Label>Категория</Label>
              <select
                {...form.register('categoryId')}
                className="w-full h-9 rounded-md border bg-background px-3 text-sm"
              >
                <option value="">— Без категории</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>Краткое описание (excerpt)</Label>
            <Textarea
              {...form.register('excerpt')}
              placeholder="2-3 предложения для превью в листинге"
              rows={2}
            />
          </div>

          <div className="space-y-1.5">
            <Label>Обложка</Label>
            <MediaPicker
              value={form.watch('coverImage') ?? ''}
              onChange={(url) => form.setValue('coverImage', url, { shouldDirty: true })}
              placeholder="Выберите из медиатеки или вставьте URL"
            />
            {form.formState.errors.coverImage && (
              <p className="text-xs text-red-500">{form.formState.errors.coverImage.message}</p>
            )}
          </div>
        </section>

        {/* Теги */}
        <section className="rounded-lg border p-5 space-y-3">
          <h2 className="font-semibold">Теги</h2>
          <div className="flex flex-wrap gap-2">
            {tags.map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 rounded-full border bg-muted px-2.5 py-0.5 text-xs"
              >
                #{t}
                <button
                  type="button"
                  onClick={() => setTags((p) => p.filter((x) => x !== t))}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              placeholder="Добавить тег..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  addTag()
                }
              }}
              className="max-w-xs"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addTag}
              disabled={!tagInput.trim()}
            >
              Добавить
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">Нажмите Enter или кнопку для добавления</p>
        </section>

        {/* Контент */}
        <section className="rounded-lg border p-5 space-y-3">
          <h2 className="font-semibold">Контент</h2>
          <RichTextEditor value={content} onChange={setContent} minHeight={400} />
        </section>

        {/* SEO */}
        <section className="rounded-lg border p-5 space-y-4">
          <h2 className="font-semibold">SEO</h2>
          <div className="space-y-1.5">
            <Label>
              Meta Title{' '}
              <span className="text-xs text-muted-foreground">
                ({(form.watch('seoTitle') ?? '').length}/60)
              </span>
            </Label>
            <Input {...form.register('seoTitle')} placeholder="Заголовок для поисковиков" />
          </div>
          <div className="space-y-1.5">
            <Label>
              Meta Description{' '}
              <span className="text-xs text-muted-foreground">
                ({(form.watch('seoDesc') ?? '').length}/160)
              </span>
            </Label>
            <Textarea
              {...form.register('seoDesc')}
              placeholder="Описание для поисковиков"
              rows={3}
            />
          </div>
        </section>
      </form>

      {/* Запланировать */}
      <Dialog open={scheduleOpen} onOpenChange={(v) => !v && setScheduleOpen(false)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Запланировать публикацию</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Label>Дата и время</Label>
            <Input
              type="datetime-local"
              value={scheduleDate}
              onChange={(e) => setScheduleDate(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Статья будет опубликована автоматически в указанное время
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setScheduleOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleSchedule} disabled={scheduling || !scheduleDate}>
              {scheduling && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Запланировать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function flattenTree(tree: Category[]): Category[] {
  const result: Category[] = []
  const traverse = (nodes: Category[]) => {
    for (const n of nodes) {
      result.push(n)
      if (n.children?.length) traverse(n.children)
    }
  }
  traverse(tree)
  return result
}
