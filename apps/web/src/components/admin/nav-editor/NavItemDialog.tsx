'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { NavItem, NavItemType } from '@/lib/api/site'

const NAV_TYPE_OPTIONS: { value: NavItemType; label: string; defaultHref: string }[] = [
  { value: 'PAGE', label: 'Страница', defaultHref: '' },
  { value: 'CATALOG', label: 'Каталог', defaultHref: '/catalog' },
  { value: 'BLOG', label: 'Блог', defaultHref: '/blog' },
  { value: 'FORUM', label: 'Форум', defaultHref: '/forum' },
  { value: 'GRAM', label: 'Соцлента', defaultHref: '/gram' },
  { value: 'EXTERNAL', label: 'Внешняя ссылка', defaultHref: '' },
  { value: 'DROPDOWN', label: 'Группа (без ссылки)', defaultHref: '' },
]

const schema = z.object({
  label: z.string().min(1, 'Введите название'),
  type: z.enum(['PAGE', 'CATALOG', 'BLOG', 'FORUM', 'GRAM', 'EXTERNAL', 'DROPDOWN']),
  href: z.string().optional(),
  icon: z.string().optional(),
  description: z.string().optional(),
  isVisible: z.boolean(),
  openInNewTab: z.boolean(),
})

type FormData = z.infer<typeof schema>

interface Props {
  open: boolean
  onClose: () => void
  onSave: (data: FormData) => Promise<void>
  initial?: Partial<NavItem>
  parentId?: number | null
  title?: string
}

export function NavItemDialog({ open, onClose, onSave, initial, title = 'Добавить пункт' }: Props) {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      label: '',
      type: 'PAGE',
      href: '',
      icon: '',
      description: '',
      isVisible: true,
      openInNewTab: false,
    },
  })

  const selectedType = watch('type')

  useEffect(() => {
    if (open) {
      reset({
        label: initial?.label ?? '',
        type: initial?.type ?? 'PAGE',
        href: initial?.href ?? '',
        icon: initial?.icon ?? '',
        description: initial?.description ?? '',
        isVisible: initial?.isVisible ?? true,
        openInNewTab: initial?.openInNewTab ?? false,
      })
    }
  }, [open, initial, reset])

  // При изменении типа — автозаполнить href если он пустой
  function handleTypeChange(value: NavItemType) {
    setValue('type', value)
    const option = NAV_TYPE_OPTIONS.find((o) => o.value === value)
    const currentHref = watch('href')
    if (option?.defaultHref && !currentHref) {
      setValue('href', option.defaultHref)
    }
    if (value === 'DROPDOWN') {
      setValue('href', '')
    }
  }

  async function onSubmit(data: FormData) {
    await onSave(data)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Текст ссылки */}
          <div className="space-y-1">
            <Label htmlFor="label">Название *</Label>
            <Input id="label" {...register('label')} placeholder="Каталог" />
            {errors.label && <p className="text-xs text-destructive">{errors.label.message}</p>}
          </div>

          {/* Тип */}
          <div className="space-y-1">
            <Label>Тип раздела</Label>
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NAV_TYPE_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* URL (скрыть для DROPDOWN) */}
          {selectedType !== 'DROPDOWN' && (
            <div className="space-y-1">
              <Label htmlFor="href">
                URL{selectedType === 'EXTERNAL' ? ' (внешняя ссылка)' : ''}
              </Label>
              <Input
                id="href"
                {...register('href')}
                placeholder={selectedType === 'EXTERNAL' ? 'https://example.com' : '/catalog'}
              />
            </div>
          )}

          {/* Иконка */}
          <div className="space-y-1">
            <Label htmlFor="icon">Иконка (Lucide, необязательно)</Label>
            <Input id="icon" {...register('icon')} placeholder="ShoppingBag" />
            <p className="text-xs text-muted-foreground">
              Имя иконки из lucide-react (например: Home, BookOpen)
            </p>
          </div>

          {/* Описание */}
          <div className="space-y-1">
            <Label htmlFor="description">Описание (необязательно, видно в подменю)</Label>
            <Input id="description" {...register('description')} placeholder="Наши товары" />
          </div>

          {/* Переключатели */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('isVisible')} className="h-4 w-4" />
              Видимый
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" {...register('openInNewTab')} className="h-4 w-4" />
              Открывать в новой вкладке
            </label>
          </div>

          <DialogFooter>
            <Button type="button" variant="ghost" onClick={onClose}>
              Отмена
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Сохранение...' : 'Сохранить'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
