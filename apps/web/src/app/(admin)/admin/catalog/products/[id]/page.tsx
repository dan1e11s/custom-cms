'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Plus, Trash2, Loader2, Save, Globe, Globe2 } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { RichTextEditor } from '@/components/admin/page-editor/RichTextEditor'
import { catalogApi } from '@/lib/api/catalog'
import type { Product, Category } from '@/types/catalog'

const schema = z.object({
  name: z.string().min(1, 'Обязательное поле').max(300),
  slug: z.string().max(300).optional(),
  price: z.coerce.number().min(0).optional().or(z.literal('')),
  oldPrice: z.coerce.number().min(0).optional().or(z.literal('')),
  inStock: z.boolean(),
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

export default function ProductEditorPage({ params }: Props) {
  const router = useRouter()
  const id = Number(params.id)

  const [product, setProduct] = useState<Product | null>(null)
  const [categories, setCategories] = useState<Category[]>([])
  const [description, setDescription] = useState('')
  const [images, setImages] = useState<string[]>([''])
  const [attributes, setAttributes] = useState<{ key: string; value: string }[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [savedMsg, setSavedMsg] = useState('')
  const [error, setError] = useState('')

  const form = useForm<FormData>({ resolver: zodResolver(schema) })

  useEffect(() => {
    Promise.all([catalogApi.getProductById(id), catalogApi.getCategoryTree()])
      .then(([p, tree]) => {
        setProduct(p)
        setCategories(flattenTree(tree))
        setDescription(p.description ?? '')
        setImages(p.images.length ? p.images : [''])
        setAttributes(
          p.attributes ? Object.entries(p.attributes).map(([key, value]) => ({ key, value })) : [],
        )
        form.reset({
          name: p.name,
          slug: p.slug,
          price: p.price ? parseFloat(p.price) : '',
          oldPrice: p.oldPrice ? parseFloat(p.oldPrice) : '',
          inStock: p.inStock,
          categoryId: p.categoryId ?? undefined,
          seoTitle: p.seoTitle ?? '',
          seoDesc: p.seoDesc ?? '',
        })
      })
      .catch((e) => setError(e.message ?? 'Ошибка загрузки'))
      .finally(() => setLoading(false))
  }, [id]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async (data: FormData) => {
    setSaving(true)
    setSavedMsg('')
    setError('')
    try {
      const attrs = attributes.reduce<Record<string, string>>((acc, { key, value }) => {
        if (key.trim()) acc[key.trim()] = value
        return acc
      }, {})

      await catalogApi.updateProduct(id, {
        name: data.name,
        slug: data.slug || undefined,
        description: description || undefined,
        price: data.price !== '' ? String(data.price) : undefined,
        oldPrice: data.oldPrice !== '' ? String(data.oldPrice) : undefined,
        inStock: data.inStock,
        categoryId: data.categoryId ?? undefined,
        images: images.filter(Boolean),
        attributes: Object.keys(attrs).length ? attrs : undefined,
        seoTitle: data.seoTitle || undefined,
        seoDesc: data.seoDesc || undefined,
      } as Parameters<typeof catalogApi.updateProduct>[1])

      setSavedMsg('Сохранено')
      setTimeout(() => setSavedMsg(''), 3000)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  const handlePublish = async () => {
    if (!product) return
    try {
      if (product.status === 'PUBLISHED') {
        const updated = await catalogApi.unpublishProduct(id)
        setProduct(updated)
      } else {
        const updated = await catalogApi.publishProduct(id)
        setProduct(updated)
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка')
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }
  if (!product) {
    return (
      <div className="py-20 text-center text-muted-foreground">{error || 'Товар не найден'}</div>
    )
  }

  return (
    <div className="space-y-6 max-w-3xl">
      {/* Шапка */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => router.push('/admin/catalog')}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <Badge
                variant={product.status === 'PUBLISHED' ? 'default' : 'secondary'}
                className="text-xs"
              >
                {product.status === 'PUBLISHED' ? 'Опубликован' : 'Черновик'}
              </Badge>
              <span className="font-mono text-xs text-muted-foreground">/{product.slug}</span>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePublish}>
            {product.status === 'PUBLISHED' ? (
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
              <Label>Название *</Label>
              <Input {...form.register('name')} placeholder="Название товара" />
              {form.formState.errors.name && (
                <p className="text-xs text-red-500">{form.formState.errors.name.message}</p>
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
            <Label>Описание</Label>
            <RichTextEditor value={description} onChange={setDescription} minHeight={150} />
          </div>
        </section>

        {/* Цена */}
        <section className="rounded-lg border p-5 space-y-4">
          <h2 className="font-semibold">Цена и наличие</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <Label>Цена, ₽</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                {...form.register('price')}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Старая цена, ₽</Label>
              <Input
                type="number"
                min={0}
                step="0.01"
                {...form.register('oldPrice')}
                placeholder="0"
              />
            </div>
            <div className="space-y-1.5">
              <Label>Наличие</Label>
              <label className="flex h-9 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm">
                <input type="checkbox" {...form.register('inStock')} className="h-4 w-4" />В наличии
              </label>
            </div>
          </div>
        </section>

        {/* Изображения */}
        <section className="rounded-lg border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Изображения</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setImages((p) => [...p, ''])}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Добавить
            </Button>
          </div>
          {images.map((url, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={url}
                onChange={(e) => setImages((p) => p.map((v, j) => (j === i ? e.target.value : v)))}
                placeholder="https://example.com/image.jpg"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setImages((p) => p.filter((_, j) => j !== i))}
                disabled={images.length === 1}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </section>

        {/* Атрибуты */}
        <section className="rounded-lg border p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">Характеристики</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setAttributes((p) => [...p, { key: '', value: '' }])}
            >
              <Plus className="mr-1.5 h-3.5 w-3.5" />
              Добавить
            </Button>
          </div>
          {attributes.length === 0 && (
            <p className="text-sm text-muted-foreground">Нет характеристик</p>
          )}
          {attributes.map((attr, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={attr.key}
                onChange={(e) =>
                  setAttributes((p) =>
                    p.map((a, j) => (j === i ? { ...a, key: e.target.value } : a)),
                  )
                }
                placeholder="Ключ (напр. Цвет)"
                className="w-40 shrink-0"
              />
              <Input
                value={attr.value}
                onChange={(e) =>
                  setAttributes((p) =>
                    p.map((a, j) => (j === i ? { ...a, value: e.target.value } : a)),
                  )
                }
                placeholder="Значение"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => setAttributes((p) => p.filter((_, j) => j !== i))}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
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
