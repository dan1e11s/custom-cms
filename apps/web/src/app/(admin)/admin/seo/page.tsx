'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2, Plus, RefreshCw, Trash2, ExternalLink, CheckCircle, XCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { seoApi, SeoSettings, Redirect } from '@/lib/api/seo'

// ── Схемы валидации ───────────────────────────────────────────────────────────

const settingsSchema = z.object({
  siteName: z.string().min(1, 'Обязательное поле').max(100),
  titleTemplate: z.string().min(1, 'Обязательное поле').max(200),
  defaultOgImage: z.string().url('Введите корректный URL').or(z.literal('')).optional(),
})

const redirectSchema = z.object({
  from: z.string().min(1).regex(/^\//, 'Путь должен начинаться с /'),
  to: z.string().min(1, 'Обязательное поле'),
  statusCode: z.coerce.number().refine((v) => v === 301 || v === 302, {
    message: 'Только 301 или 302',
  }),
})

type SettingsForm = z.infer<typeof settingsSchema>
type RedirectForm = z.infer<typeof redirectSchema>

// ── Компонент ─────────────────────────────────────────────────────────────────

export default function AdminSeoPage() {
  const [settings, setSettings] = useState<SeoSettings | null>(null)
  const [redirects, setRedirects] = useState<Redirect[]>([])
  const [loading, setLoading] = useState(true)
  const [settingsSaving, setSettingsSaving] = useState(false)
  const [settingsSaved, setSettingsSaved] = useState(false)
  const [sitemapRebuilding, setSitemapRebuilding] = useState(false)
  const [sitemapMessage, setSitemapMessage] = useState('')
  const [redirectAdding, setRedirectAdding] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [error, setError] = useState('')

  // ── Загрузка данных ─────────────────────────────────────────────────────────

  useEffect(() => {
    const load = async () => {
      try {
        const [s, r] = await Promise.all([seoApi.getSettings(), seoApi.getRedirects()])
        setSettings(s)
        setRedirects(r)
      } catch {
        setError('Не удалось загрузить данные')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  // ── Форма настроек ──────────────────────────────────────────────────────────

  const settingsForm = useForm<SettingsForm>({
    resolver: zodResolver(settingsSchema),
    values: settings
      ? {
          siteName: settings.siteName,
          titleTemplate: settings.titleTemplate,
          defaultOgImage: settings.defaultOgImage ?? '',
        }
      : undefined,
  })

  const onSaveSettings = async (data: SettingsForm) => {
    setSettingsSaving(true)
    setSettingsSaved(false)
    try {
      const updated = await seoApi.updateSettings({
        siteName: data.siteName,
        titleTemplate: data.titleTemplate,
        defaultOgImage: data.defaultOgImage || undefined,
      })
      setSettings(updated)
      setSettingsSaved(true)
      setTimeout(() => setSettingsSaved(false), 3000)
    } catch {
      setError('Не удалось сохранить настройки')
    } finally {
      setSettingsSaving(false)
    }
  }

  // ── Форма нового редиректа ──────────────────────────────────────────────────

  const redirectForm = useForm<RedirectForm>({
    resolver: zodResolver(redirectSchema),
    defaultValues: { from: '/', to: '/', statusCode: 301 },
  })

  const onAddRedirect = async (data: RedirectForm) => {
    setRedirectAdding(true)
    try {
      const created = await seoApi.createRedirect(data)
      setRedirects((prev) => [created, ...prev])
      redirectForm.reset({ from: '/', to: '/', statusCode: 301 })
      setShowAddForm(false)
    } catch {
      setError('Не удалось создать редирект. Проверьте, что путь уникален.')
    } finally {
      setRedirectAdding(false)
    }
  }

  const onToggleRedirect = async (id: number, isActive: boolean) => {
    try {
      const updated = await seoApi.updateRedirect(id, { isActive: !isActive })
      setRedirects((prev) => prev.map((r) => (r.id === id ? updated : r)))
    } catch {
      setError('Не удалось изменить статус редиректа')
    }
  }

  const onDeleteRedirect = async (id: number) => {
    try {
      await seoApi.deleteRedirect(id)
      setRedirects((prev) => prev.filter((r) => r.id !== id))
    } catch {
      setError('Не удалось удалить редирект')
    }
  }

  // ── Пересборка sitemap ──────────────────────────────────────────────────────

  const onRebuildSitemap = async () => {
    setSitemapRebuilding(true)
    setSitemapMessage('')
    try {
      const result = await seoApi.rebuildSitemap()
      setSitemapMessage(result.message)
      // Обновляем время последней сборки
      const updated = await seoApi.getSettings()
      setSettings(updated)
    } catch {
      setSitemapMessage('Ошибка при пересборке sitemap')
    } finally {
      setSitemapRebuilding(false)
    }
  }

  // ── Рендер ──────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Загрузка...
      </div>
    )
  }

  return (
    <div className="space-y-10 max-w-3xl">
      <div>
        <h1 className="text-2xl font-bold">SEO-настройки</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Глобальные параметры, редиректы и управление sitemap
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
          <button className="ml-2 underline" onClick={() => setError('')}>
            Закрыть
          </button>
        </div>
      )}

      {/* ─── Глобальные настройки ──────────────────────────────────────────── */}
      <section className="rounded-lg border p-6 space-y-5">
        <h2 className="text-lg font-semibold">Глобальные настройки</h2>

        <form onSubmit={settingsForm.handleSubmit(onSaveSettings)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="siteName">Название сайта</Label>
            <Input id="siteName" placeholder="Мой сайт" {...settingsForm.register('siteName')} />
            {settingsForm.formState.errors.siteName && (
              <p className="text-xs text-red-500">
                {settingsForm.formState.errors.siteName.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="titleTemplate">
              Шаблон мета-тайтла
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                %s — заголовок страницы
              </span>
            </Label>
            <Input
              id="titleTemplate"
              placeholder="%s | Мой сайт"
              {...settingsForm.register('titleTemplate')}
            />
            {settingsForm.formState.errors.titleTemplate && (
              <p className="text-xs text-red-500">
                {settingsForm.formState.errors.titleTemplate.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="defaultOgImage">
              Дефолтный OG Image URL
              <span className="ml-2 text-xs text-muted-foreground font-normal">опционально</span>
            </Label>
            <Input
              id="defaultOgImage"
              type="url"
              placeholder="https://example.com/og-default.jpg"
              {...settingsForm.register('defaultOgImage')}
            />
            {settingsForm.formState.errors.defaultOgImage && (
              <p className="text-xs text-red-500">
                {settingsForm.formState.errors.defaultOgImage.message}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <Button type="submit" disabled={settingsSaving}>
              {settingsSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Сохранить
            </Button>
            {settingsSaved && (
              <span className="flex items-center gap-1 text-sm text-green-600">
                <CheckCircle className="h-4 w-4" /> Сохранено
              </span>
            )}
          </div>
        </form>
      </section>

      {/* ─── Sitemap ────────────────────────────────────────────────────────── */}
      <section className="rounded-lg border p-6 space-y-4">
        <h2 className="text-lg font-semibold">Sitemap</h2>

        <div className="flex items-center gap-4 text-sm">
          <span className="text-muted-foreground">
            Последняя сборка:{' '}
            {settings?.sitemapBuiltAt
              ? new Date(settings.sitemapBuiltAt).toLocaleString('ru-RU')
              : 'не собирался'}
          </span>
          <a
            href="/sitemap.xml"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            sitemap.xml
          </a>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={onRebuildSitemap} disabled={sitemapRebuilding}>
            {sitemapRebuilding ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="mr-2 h-4 w-4" />
            )}
            Пересобрать sitemap
          </Button>
          {sitemapMessage && (
            <span className="text-sm text-muted-foreground">{sitemapMessage}</span>
          )}
        </div>

        <p className="text-xs text-muted-foreground">
          Sitemap автоматически пересобирается каждый час. Кнопка выше запускает немедленную
          пересборку.
        </p>
      </section>

      {/* ─── Редиректы ──────────────────────────────────────────────────────── */}
      <section className="rounded-lg border p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            Редиректы
            {redirects.length > 0 && (
              <Badge variant="secondary" className="ml-2">
                {redirects.length}
              </Badge>
            )}
          </h2>
          <Button size="sm" variant="outline" onClick={() => setShowAddForm((v) => !v)}>
            <Plus className="mr-1.5 h-4 w-4" />
            Добавить
          </Button>
        </div>

        {/* Форма добавления */}
        {showAddForm && (
          <form
            onSubmit={redirectForm.handleSubmit(onAddRedirect)}
            className="rounded-md border bg-muted/30 p-4 space-y-3"
          >
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Откуда (From)</Label>
                <Input placeholder="/старый-путь" {...redirectForm.register('from')} />
                {redirectForm.formState.errors.from && (
                  <p className="text-xs text-red-500">
                    {redirectForm.formState.errors.from.message}
                  </p>
                )}
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Куда (To)</Label>
                <Input placeholder="/новый-путь" {...redirectForm.register('to')} />
                {redirectForm.formState.errors.to && (
                  <p className="text-xs text-red-500">{redirectForm.formState.errors.to.message}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Код</Label>
                <select
                  className="h-9 rounded-md border bg-background px-3 text-sm"
                  {...redirectForm.register('statusCode')}
                >
                  <option value={301}>301 (постоянный)</option>
                  <option value={302}>302 (временный)</option>
                </select>
              </div>
              <div className="flex gap-2 mt-5">
                <Button type="submit" size="sm" disabled={redirectAdding}>
                  {redirectAdding && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />}
                  Создать
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    setShowAddForm(false)
                    redirectForm.reset()
                  }}
                >
                  Отмена
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Таблица редиректов */}
        {redirects.length === 0 ? (
          <p className="text-sm text-muted-foreground">Редиректы не добавлены</p>
        ) : (
          <div className="overflow-hidden rounded-md border">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="py-2 px-3 text-left font-medium text-muted-foreground">Откуда</th>
                  <th className="py-2 px-3 text-left font-medium text-muted-foreground">Куда</th>
                  <th className="py-2 px-3 text-left font-medium text-muted-foreground">Код</th>
                  <th className="py-2 px-3 text-left font-medium text-muted-foreground">Статус</th>
                  <th className="py-2 px-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {redirects.map((r) => (
                  <tr key={r.id} className="hover:bg-muted/20">
                    <td className="py-2 px-3 font-mono text-xs">{r.from}</td>
                    <td className="py-2 px-3 font-mono text-xs text-muted-foreground">{r.to}</td>
                    <td className="py-2 px-3">
                      <Badge
                        variant={r.statusCode === 301 ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {r.statusCode}
                      </Badge>
                    </td>
                    <td className="py-2 px-3">
                      <button
                        onClick={() => onToggleRedirect(r.id, r.isActive)}
                        className="flex items-center gap-1 text-xs"
                        title={r.isActive ? 'Отключить' : 'Включить'}
                      >
                        {r.isActive ? (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground" />
                        )}
                        {r.isActive ? 'Активен' : 'Отключён'}
                      </button>
                    </td>
                    <td className="py-2 px-3 text-right">
                      <button
                        onClick={() => onDeleteRedirect(r.id)}
                        className="text-muted-foreground hover:text-red-500 transition-colors"
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  )
}
