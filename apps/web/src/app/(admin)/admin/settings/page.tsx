'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Spinner } from '@/components/ui/spinner'
import { siteAdminApi } from '@/lib/api/site'
import { toast } from '@/lib/toast'

export default function AdminSettingsPage() {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [form, setForm] = useState({
    siteName: '',
    titleTemplate: '',
    logoUrl: '',
    logoText: '',
    footerCopyright: '',
  })

  useEffect(() => {
    siteAdminApi
      .getSettings()
      .then((data) => {
        setForm({
          siteName: data.siteName ?? '',
          titleTemplate: data.titleTemplate ?? '',
          logoUrl: data.logoUrl ?? '',
          logoText: data.logoText ?? '',
          footerCopyright: data.footerCopyright ?? '',
        })
      })
      .catch(() => toast.error('Не удалось загрузить настройки'))
      .finally(() => setLoading(false))
  }, [])

  async function handleSave() {
    setSaving(true)
    try {
      await siteAdminApi.updateSettings(form)
      toast.success('Настройки сохранены')
    } catch {
      toast.error('Ошибка при сохранении')
    } finally {
      setSaving(false)
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
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold">Настройки сайта</h1>
        <p className="text-sm text-muted-foreground">Общие параметры, логотип и тексты.</p>
      </div>

      {/* Основные настройки */}
      <section className="space-y-4 rounded-lg border border-border p-5">
        <h2 className="font-semibold">Основные</h2>

        <div className="space-y-1.5">
          <Label htmlFor="siteName">Название сайта</Label>
          <Input
            id="siteName"
            value={form.siteName}
            onChange={(e) => setForm((f) => ({ ...f, siteName: e.target.value }))}
            placeholder="Мой сайт"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="titleTemplate">Шаблон мета-заголовка</Label>
          <Input
            id="titleTemplate"
            value={form.titleTemplate}
            onChange={(e) => setForm((f) => ({ ...f, titleTemplate: e.target.value }))}
            placeholder="%s | Мой сайт"
          />
          <p className="text-xs text-muted-foreground">
            %s заменяется на заголовок конкретной страницы
          </p>
        </div>
      </section>

      {/* Логотип */}
      <section className="space-y-4 rounded-lg border border-border p-5">
        <h2 className="font-semibold">Логотип в шапке</h2>

        <div className="space-y-1.5">
          <Label htmlFor="logoUrl">URL изображения-логотипа</Label>
          <Input
            id="logoUrl"
            value={form.logoUrl}
            onChange={(e) => setForm((f) => ({ ...f, logoUrl: e.target.value }))}
            placeholder="https://... или /uploads/logo.webp"
          />
          <p className="text-xs text-muted-foreground">
            Если задан — в шапке отображается картинка вместо текста
          </p>
        </div>

        {form.logoUrl && (
          <div className="flex items-center gap-3 rounded-md border border-border bg-muted/40 p-3">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={form.logoUrl}
              alt="Превью логотипа"
              className="h-10 max-w-[160px] object-contain"
              onError={(e) => {
                ;(e.target as HTMLImageElement).style.display = 'none'
              }}
            />
            <span className="text-xs text-muted-foreground">Превью</span>
          </div>
        )}

        <div className="space-y-1.5">
          <Label htmlFor="logoText">Текстовый логотип (fallback)</Label>
          <Input
            id="logoText"
            value={form.logoText}
            onChange={(e) => setForm((f) => ({ ...f, logoText: e.target.value }))}
            placeholder="Моя компания"
          />
          <p className="text-xs text-muted-foreground">
            Отображается, если изображение не задано. Если оба пустые — используется название сайта.
          </p>
        </div>
      </section>

      {/* Футер */}
      <section className="space-y-4 rounded-lg border border-border p-5">
        <h2 className="font-semibold">Подвал (футер)</h2>

        <div className="space-y-1.5">
          <Label htmlFor="footerCopyright">Текст копирайта</Label>
          <Input
            id="footerCopyright"
            value={form.footerCopyright}
            onChange={(e) => setForm((f) => ({ ...f, footerCopyright: e.target.value }))}
            placeholder="© 2026 Моя компания. Все права защищены."
          />
        </div>
      </section>

      <Button onClick={handleSave} disabled={saving} className="w-full md:w-auto">
        {saving ? 'Сохранение...' : 'Сохранить настройки'}
      </Button>
    </div>
  )
}
