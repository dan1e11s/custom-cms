'use client'

import { useCallback, useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { notificationsApi } from '@/lib/api/notifications'
import { useNotificationsSocket } from '@/lib/hooks/useNotificationsSocket'
import { cn } from '@/lib/utils'
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
  if (m < 60) return `${m} мин. назад`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} ч. назад`
  return `${Math.floor(h / 24)} дн. назад`
}

export default function NotificationsPage() {
  const [items, setItems] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    notificationsApi
      .getAll(100)
      .then(setItems)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  useNotificationsSocket({
    onNotification: useCallback((n: Notification) => {
      setItems((prev) => [n, ...prev])
    }, []),
  })

  const handleMarkAll = async () => {
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

  const unread = items.filter((n) => !n.isRead).length

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Шапка */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Уведомления</h1>
          {unread > 0 && <p className="text-sm text-muted-foreground">{unread} непрочитанных</p>}
        </div>

        <div className="flex items-center gap-2">
          {unread > 0 && (
            <Button variant="outline" size="sm" onClick={handleMarkAll}>
              <Check className="mr-1.5 h-3.5 w-3.5" />
              Прочитать все
            </Button>
          )}
          {items.length > 0 && (
            <Button variant="outline" size="sm" onClick={handleDeleteAll}>
              <Trash2 className="mr-1.5 h-3.5 w-3.5" />
              Удалить все
            </Button>
          )}
        </div>
      </div>

      {loading && <div className="py-16 text-center text-muted-foreground">Загрузка...</div>}

      {!loading && items.length === 0 && (
        <div className="rounded-xl border border-border bg-card py-16 text-center text-muted-foreground">
          Уведомлений нет
        </div>
      )}

      <div className="space-y-2">
        {items.map((n) => (
          <Link
            key={n.id}
            href={n.payload.url}
            onClick={() => {
              if (!n.isRead) handleMarkRead(n.id)
            }}
            className={cn(
              'flex items-start gap-3 rounded-xl border border-border p-4 text-sm transition-colors hover:bg-accent',
              !n.isRead && 'bg-primary/5 border-primary/20',
            )}
          >
            <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-base">
              {TYPE_ICON[n.type]}
            </span>

            <div className="flex-1 min-w-0">
              <p className="leading-snug">
                <span className="font-semibold">@{n.payload.actorName}</span>{' '}
                <span className="text-muted-foreground">{n.payload.text}</span>
              </p>
              <time className="text-xs text-muted-foreground">{timeAgo(n.createdAt)}</time>
            </div>

            {!n.isRead && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
          </Link>
        ))}
      </div>
    </div>
  )
}
