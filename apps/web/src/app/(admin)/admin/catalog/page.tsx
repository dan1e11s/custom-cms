'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  Plus,
  Edit2,
  Trash2,
  Globe,
  Globe2,
  Package,
  FolderTree,
  Loader2,
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
import { catalogApi } from '@/lib/api/catalog'
import type { Product, Category, ProductsListResponse } from '@/types/catalog'

const STATUS_LABEL: Record<string, string> = {
  DRAFT: 'Черновик',
  PUBLISHED: 'Опубликован',
  ARCHIVED: 'Архив',
}
const STATUS_VARIANT: Record<string, 'default' | 'secondary' | 'outline'> = {
  DRAFT: 'secondary',
  PUBLISHED: 'default',
  ARCHIVED: 'outline',
}

function formatPrice(v: string | null) {
  if (!v) return '—'
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0,
  }).format(parseFloat(v))
}

// ── Вкладка Товары ────────────────────────────────────────────────────────────

function ProductsTab() {
  const router = useRouter()
  const [data, setData] = useState<ProductsListResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      setData(await catalogApi.getAllProducts({ search, limit: 50 }))
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
    if (!newName.trim()) return
    setCreating(true)
    try {
      const product = await catalogApi.createProduct({ name: newName.trim() })
      router.push(`/admin/catalog/products/${product.id}`)
    } catch {
      setCreating(false)
    }
  }

  const handlePublish = async (p: Product) => {
    try {
      if (p.status === 'PUBLISHED') await catalogApi.unpublishProduct(p.id)
      else await catalogApi.publishProduct(p.id)
      load()
    } catch {
      /* ignore */
    }
  }

  const handleDelete = async (id: number) => {
    setDeleting(true)
    try {
      await catalogApi.deleteProduct(id)
      setDeleteId(null)
      load()
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="relative max-w-xs flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию..."
            className="pl-9"
          />
        </div>
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Создать товар
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : !data?.items.length ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/10 py-20 text-muted-foreground">
          <Package className="mb-4 h-12 w-12 opacity-25" />
          <p className="font-medium">Товаров пока нет</p>
          <Button className="mt-4" onClick={() => setCreateOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Создать первый товар
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border bg-background">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/30">
                {['Название', 'Категория', 'Цена', 'Наличие', 'Статус', ''].map((h) => (
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
                      onClick={() => router.push(`/admin/catalog/products/${p.id}`)}
                      className="font-medium hover:text-primary text-left"
                    >
                      {p.name}
                    </button>
                    <div className="font-mono text-xs text-muted-foreground">/{p.slug}</div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{p.category?.name ?? '—'}</td>
                  <td className="px-4 py-3">{formatPrice(p.price)}</td>
                  <td className="px-4 py-3">
                    <Badge variant={p.inStock ? 'default' : 'secondary'} className="text-xs">
                      {p.inStock ? 'Есть' : 'Нет'}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant={STATUS_VARIANT[p.status] ?? 'secondary'}>
                      {STATUS_LABEL[p.status] ?? p.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title="Редактировать"
                        onClick={() => router.push(`/admin/catalog/products/${p.id}`)}
                      >
                        <Edit2 className="h-3.5 w-3.5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8"
                        title={p.status === 'PUBLISHED' ? 'Снять' : 'Опубликовать'}
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

      <Dialog
        open={createOpen}
        onOpenChange={(v) => {
          setCreateOpen(v)
          if (!v) setNewName('')
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Новый товар</DialogTitle>
          </DialogHeader>
          <div className="space-y-1.5">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Название товара"
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
            />
            <p className="text-xs text-muted-foreground">Slug будет сгенерирован автоматически</p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Создать и открыть
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Удалить товар?</DialogTitle>
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

// ── Вкладка Категории ─────────────────────────────────────────────────────────

function CategoriesTab() {
  const [tree, setTree] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [createOpen, setCreateOpen] = useState(false)
  const [newName, setNewName] = useState('')
  const [parentId, setParentId] = useState<number | ''>('')
  const [creating, setCreating] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [deleting, setDeleting] = useState(false)

  const load = async () => {
    setLoading(true)
    try {
      setTree(await catalogApi.getCategoryTree())
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async () => {
    if (!newName.trim()) return
    setCreating(true)
    try {
      await catalogApi.createCategory({
        name: newName.trim(),
        parentId: parentId ? Number(parentId) : undefined,
      })
      setCreateOpen(false)
      setNewName('')
      setParentId('')
      load()
    } catch {
      setCreating(false)
    }
  }

  const handleDelete = async (id: number) => {
    setDeleting(true)
    try {
      await catalogApi.deleteCategory(id)
      setDeleteId(null)
      load()
    } catch {
      setDeleting(false)
    }
  }

  const flatCategories = flattenTree(tree)

  function renderTree(nodes: Category[], depth = 0): React.ReactNode {
    return nodes.map((cat) => (
      <div key={cat.id}>
        <div
          className={`flex items-center justify-between rounded-md px-3 py-2 hover:bg-muted/50 transition-colors`}
          style={{ paddingLeft: `${0.75 + depth * 1.5}rem` }}
        >
          <span className="text-sm font-medium">
            {cat.name}
            <span className="ml-2 font-mono text-xs text-muted-foreground">/{cat.slug}</span>
          </span>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:text-destructive"
            onClick={() => setDeleteId(cat.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>
        {cat.children?.length ? renderTree(cat.children, depth + 1) : null}
      </div>
    ))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Добавить категорию
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : tree.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border bg-muted/10 py-20 text-muted-foreground">
          <FolderTree className="mb-4 h-12 w-12 opacity-25" />
          <p className="font-medium">Категорий пока нет</p>
        </div>
      ) : (
        <div className="rounded-lg border bg-background">{renderTree(tree)}</div>
      )}

      <Dialog
        open={createOpen}
        onOpenChange={(v) => {
          setCreateOpen(v)
          if (!v) {
            setNewName('')
            setParentId('')
          }
        }}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Новая категория</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Название</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Электроника"
                autoFocus
                onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              />
            </div>
            {flatCategories.length > 0 && (
              <div className="space-y-1.5">
                <Label>Родительская категория</Label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : '')}
                  className="w-full h-9 rounded-md border bg-background px-3 text-sm"
                >
                  <option value="">— Корневая категория</option>
                  {flatCategories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)}>
              Отмена
            </Button>
            <Button onClick={handleCreate} disabled={creating || !newName.trim()}>
              {creating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Создать
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteId !== null} onOpenChange={(v) => !v && setDeleteId(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Удалить категорию?</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Удаление возможно только если нет вложенных категорий.
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
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}Удалить
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── Главная страница ───────────────────────────────────────────────────────────

type Tab = 'products' | 'categories'

export default function AdminCatalogPage() {
  const [tab, setTab] = useState<Tab>('products')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Каталог</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Управление товарами и категориями</p>
      </div>

      <div className="flex gap-1 rounded-lg border bg-muted/30 p-1 w-fit">
        {(
          [
            ['products', 'Товары', Package],
            ['categories', 'Категории', FolderTree],
          ] as const
        ).map(([key, label, Icon]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium transition-colors ${
              tab === key
                ? 'bg-background shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Icon className="h-4 w-4" />
            {label}
          </button>
        ))}
      </div>

      {tab === 'products' ? <ProductsTab /> : <CategoriesTab />}
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
