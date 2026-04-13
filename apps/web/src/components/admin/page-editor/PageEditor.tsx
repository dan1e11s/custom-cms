'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Globe, FileText, AlertCircle, CheckCircle2 } from 'lucide-react'
import { useEditorStore } from '@/store/editor.store'
import type { Page } from '@/types/pages'
import { BlockList } from './BlockList'
import { BlockEditPanel } from './BlockEditPanel'
import { SeoTab } from './SeoTab'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

interface PageEditorProps {
  initialPage: Page
}

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

export function PageEditor({ initialPage }: PageEditorProps) {
  const router = useRouter()
  const {
    init,
    title,
    setTitle,
    status,
    blocks,
    isDirty,
    isSaving,
    saveError,
    activeTab,
    setActiveTab,
    save,
    publish,
  } = useEditorStore()

  // Инициализируем стор при маунте / смене страницы
  useEffect(() => {
    init(initialPage)
  }, [initialPage.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Автосохранение через 2 секунды после последнего изменения.
  // Ошибки ловим локально — не даём им вызвать logout через глобальный обработчик 401.
  useEffect(() => {
    if (!isDirty) return
    const timer = setTimeout(() => {
      save().catch((err) => {
        // Ошибка уже сохранена в saveError через store.
        // Если это не ошибка авторизации — просто логируем.
        if (err?.status !== 401) {
          console.warn('[autosave] failed:', err?.message ?? err)
        }
      })
    }, 2000)
    return () => clearTimeout(timer)
  }, [blocks, title, isDirty]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex flex-col h-[calc(100vh-105px)] bg-background rounded-lg border shadow-sm overflow-hidden">
      {/* ─── Топ-бар ─────────────────────────────────────────────────────────── */}
      <div className="flex h-14 shrink-0 items-center gap-3 border-b px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.push('/admin/pages')}
          title="К списку страниц"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>

        <Input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="h-8 max-w-xs font-medium"
          placeholder="Название страницы"
        />

        <Badge variant={STATUS_VARIANT[status] ?? 'secondary'}>
          {STATUS_LABEL[status] ?? status}
        </Badge>

        {/* Статус сохранения */}
        {isSaving && (
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Spinner size="sm" />
            Сохранение...
          </span>
        )}
        {!isSaving && isDirty && !saveError && (
          <span className="flex items-center gap-1 text-xs text-amber-600">
            <AlertCircle className="h-3 w-3" />
            Есть изменения
          </span>
        )}
        {!isSaving && saveError && (
          <span className="flex items-center gap-1 text-xs text-destructive" title={saveError}>
            <AlertCircle className="h-3 w-3" />
            Ошибка сохранения
          </span>
        )}
        {!isSaving && !isDirty && !saveError && title && (
          <span className="flex items-center gap-1 text-xs text-emerald-600">
            <CheckCircle2 className="h-3 w-3" />
            Сохранено
          </span>
        )}

        <div className="ml-auto flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => save().catch(() => null)}
            disabled={isSaving || !isDirty}
          >
            {isSaving ? <Spinner size="sm" className="mr-2" /> : <Save className="h-4 w-4 mr-2" />}
            Сохранить
          </Button>

          {status !== 'PUBLISHED' && (
            <Button size="sm" onClick={() => publish().catch(() => null)} disabled={isSaving}>
              <Globe className="h-4 w-4 mr-2" />
              Опубликовать
            </Button>
          )}
        </div>
      </div>

      {/* ─── Основная область ─────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">
        {/* ── Левая панель ── */}
        <div className="flex w-72 shrink-0 flex-col border-r bg-muted/10 overflow-hidden">
          {/* Вкладки */}
          <div className="flex shrink-0 border-b">
            <button
              type="button"
              onClick={() => setActiveTab('blocks')}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 text-sm font-medium transition-colors',
                activeTab === 'blocks'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <FileText className="h-3.5 w-3.5" />
              Блоки
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('seo')}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 border-b-2 py-2.5 text-sm font-medium transition-colors',
                activeTab === 'seo'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <Globe className="h-3.5 w-3.5" />
              SEO
            </button>
          </div>

          {/* Содержимое вкладки */}
          <div className="flex-1 overflow-hidden">
            {activeTab === 'blocks' && <BlockList />}
            {activeTab === 'seo' && (
              <div className="h-full overflow-y-auto p-4">
                <SeoTab />
              </div>
            )}
          </div>
        </div>

        {/* ── Правая панель (форма редактирования) ── */}
        <div className="flex-1 overflow-y-auto">
          {activeTab === 'blocks' && (
            <div className="p-6 max-w-2xl">
              <BlockEditPanel />
            </div>
          )}
          {activeTab === 'seo' && (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Globe className="h-12 w-12 mb-4 opacity-20" />
              <p className="font-medium">SEO-настройки</p>
              <p className="text-sm mt-1 opacity-70">Заполните поля в левой панели</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
