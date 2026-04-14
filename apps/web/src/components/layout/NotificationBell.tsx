'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, Check, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { notificationsApi } from '@/lib/api/notifications'
import { useNotificationsSocket } from '@/lib/hooks/useNotificationsSocket'
import { useAuthStore } from '@/store/auth.store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { Notification } from '@/types/notification'

const TYPE_ICON: Record<Notification['type'], string> = {
  like: '♥',
  post_comment: '💬',
  comment_reply: '↩',
  forum_reply: '📋',
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return 'только что'
  if (m < 60) return `${m} мин.`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч.`
  return `${Math.floor(h / 24)} дн.`
}

export function NotificationBell() {
  const user = useAuthStore((s) => s.user)
  const [items, setItems] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const [loaded, setLoaded] = useState(false)

  const unread = items.filter((n) => !n.isRead).length

  // ── Загрузка при первом открытии ──────────────────────────────────────────

  useEffect(() => {
    if (!user || !open || loaded) return
    notificationsApi
      .getAll()
      .then((data) => {
        setItems(data)
        setLoaded(true)
      })
      .catch(() => {})
  }, [user, open, loaded])

  // ── Real-time WS ──────────────────────────────────────────────────────────

  useNotificationsSocket({
    onNotification: useCallback((n: Notification) => {
      setItems((prev) => [n, ...prev])
    }, []),
  })

  // ── Действия ──────────────────────────────────────────────────────────────

  const handleMarkAllRead = async () => {
    await notificationsApi.markAllRead().catch(() => {})
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })))
  }

  const handleMarkRead = async (id: number) => {
    await notificationsApi.markRead(id).catch(() => {})
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
  }

  const handleDeleteAll = async () => {
    await notificationsApi.deleteAll().catch(() => {})
    setItems([])
  }

  if (!user) return null

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <button
          className="relative flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          aria-label="Уведомления"
        >
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold leading-none text-primary-foreground">
              {unread > 9 ? '9+' : unread}
            </span>
          )}
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-80 p-0" sideOffset={8}>
        {/* Шапка */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <span className="font-semibold text-sm">Уведомления</span>
          <div className="flex items-center gap-1">
            {unread > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
                title="Прочитать все"
              >
                <Check className="h-3.5 w-3.5" />
                Прочитать все
              </button>
            )}
            {items.length > 0 && (
              <button
                onClick={handleDeleteAll}
                className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-destructive"
                title="Удалить все"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Список */}
        <div className="max-h-[400px] overflow-y-auto">
          {items.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">Уведомлений пока нет</p>
          ) : (
            items.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onRead={() => handleMarkRead(n.id)}
                onClose={() => setOpen(false)}
              />
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// ── Элемент уведомления ───────────────────────────────────────────────────────

function NotificationItem({
  notification: n,
  onRead,
  onClose,
}: {
  notification: Notification
  onRead: () => void
  onClose: () => void
}) {
  const handleClick = () => {
    if (!n.isRead) onRead()
    onClose()
  }

  return (
    <Link
      href={n.payload.url}
      onClick={handleClick}
      className={cn(
        'flex items-start gap-3 px-4 py-3 text-sm transition-colors hover:bg-accent',
        !n.isRead && 'bg-primary/5',
      )}
    >
      {/* Иконка типа */}
      <span className="mt-0.5 flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-muted text-base">
        {TYPE_ICON[n.type]}
      </span>

      {/* Текст */}
      <div className="min-w-0 flex-1">
        <p className="leading-snug">
          <span className="font-semibold">@{n.payload.actorName}</span>{' '}
          <span className="text-muted-foreground">{n.payload.text}</span>
        </p>
        <time className="text-xs text-muted-foreground">{timeAgo(n.createdAt)} назад</time>
      </div>

      {/* Индикатор непрочитанного */}
      {!n.isRead && <span className="mt-2 h-2 w-2 flex-shrink-0 rounded-full bg-primary" />}
    </Link>
  )
}
