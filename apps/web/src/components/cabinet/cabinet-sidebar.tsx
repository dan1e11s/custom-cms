'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Bell,
  FileText,
  LayoutDashboard,
  MessageCircle,
  MessageSquare,
  Shield,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/cabinet', label: 'Обзор', icon: LayoutDashboard, exact: true },
  { href: '/cabinet/profile', label: 'Профиль', icon: User },
  { href: '/cabinet/posts', label: 'Мои посты', icon: FileText },
  { href: '/cabinet/comments', label: 'Комментарии', icon: MessageSquare },
  { href: '/cabinet/forum', label: 'Форум', icon: MessageCircle },
  { href: '/cabinet/notifications', label: 'Уведомления', icon: Bell },
  { href: '/cabinet/security', label: 'Безопасность', icon: Shield },
]

export function CabinetSidebar() {
  const pathname = usePathname()

  return (
    <aside className="flex h-full w-56 shrink-0 flex-col border-r border-border bg-muted/40">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/" className="text-base font-bold text-primary">
          ← На сайт
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        <p className="mb-1 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Кабинет
        </p>
        <nav>
          <ul className="space-y-0.5">
            {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
              const isActive = exact ? pathname === href : pathname.startsWith(href)
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    {label}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      </div>
    </aside>
  )
}
