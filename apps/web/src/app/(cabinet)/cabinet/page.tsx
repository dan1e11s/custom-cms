'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Bell, FileText, MessageCircle, MessageSquare, Shield, User } from 'lucide-react'
import { usersApi } from '@/lib/api/users'
import { notificationsApi } from '@/lib/api/notifications'
import { useAuthStore } from '@/store/auth.store'
import type { User as UserType } from '@/types/auth'

const SECTIONS = [
  {
    href: '/cabinet/profile',
    label: 'Профиль',
    desc: 'Редактировать аватар, имя и bio',
    icon: User,
  },
  {
    href: '/cabinet/posts',
    label: 'Мои посты',
    desc: 'Посты опубликованные в Граме',
    icon: FileText,
  },
  {
    href: '/cabinet/comments',
    label: 'Комментарии',
    desc: 'Мои комментарии к постам',
    icon: MessageSquare,
  },
  {
    href: '/cabinet/forum',
    label: 'Форум',
    desc: 'Темы и сообщения на форуме',
    icon: MessageCircle,
  },
  {
    href: '/cabinet/notifications',
    label: 'Уведомления',
    desc: 'Все уведомления и настройки',
    icon: Bell,
  },
  {
    href: '/cabinet/security',
    label: 'Безопасность',
    desc: 'Смена пароля',
    icon: Shield,
  },
]

export default function CabinetPage() {
  const storeUser = useAuthStore((s) => s.user)
  const [profile, setProfile] = useState<UserType | null>(null)
  const [unread, setUnread] = useState(0)

  useEffect(() => {
    usersApi
      .getMe()
      .then(setProfile)
      .catch(() => {})
    notificationsApi
      .getUnreadCount()
      .then((r) => setUnread(r.count))
      .catch(() => {})
  }, [])

  const displayUser = profile ?? storeUser

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      {/* Шапка профиля */}
      <div className="flex items-center gap-5 rounded-xl border border-border bg-card p-6">
        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl font-bold uppercase text-primary">
          {profile?.avatar ? (
            <img
              src={profile.avatar}
              alt={displayUser?.username ?? ''}
              className="h-16 w-16 rounded-full object-cover"
            />
          ) : (
            (displayUser?.username?.[0] ?? '?')
          )}
        </div>

        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold">{displayUser?.username ?? '...'}</h1>
          <p className="text-sm text-muted-foreground">{displayUser?.email ?? ''}</p>
          {profile?.bio && (
            <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
          )}
        </div>

        <Link
          href="/cabinet/profile"
          className="shrink-0 rounded-md border border-border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent"
        >
          Редактировать
        </Link>
      </div>

      {/* Карточки разделов */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {SECTIONS.map(({ href, label, desc, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className="group flex flex-col gap-2 rounded-xl border border-border bg-card p-5 transition-colors hover:border-primary/50 hover:bg-accent/50"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary group-hover:bg-primary/20">
                <Icon className="h-4 w-4" />
              </span>
              <span className="font-semibold text-sm">
                {label}
                {href === '/cabinet/notifications' && unread > 0 && (
                  <span className="ml-2 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">
                    {unread}
                  </span>
                )}
              </span>
            </div>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
