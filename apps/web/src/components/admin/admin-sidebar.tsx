'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  FileText,
  ShoppingBag,
  BookOpen,
  Image as ImageIcon,
  Search,
  Users,
  Settings,
  MessageSquare,
  Instagram,
  ExternalLink,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { href: '/admin', label: 'Дашборд', icon: LayoutDashboard, exact: true },
  { href: '/admin/pages', label: 'Страницы', icon: FileText },
  { href: '/admin/catalog', label: 'Каталог', icon: ShoppingBag },
  { href: '/admin/blog', label: 'Блог', icon: BookOpen },
  { href: '/admin/gram', label: 'Грам', icon: Instagram },
  { href: '/admin/forum', label: 'Форум', icon: MessageSquare },
  { href: '/admin/media', label: 'Медиа', icon: ImageIcon },
  { href: '/admin/seo', label: 'SEO', icon: Search },
  { href: '/admin/users', label: 'Пользователи', icon: Users },
  { href: '/admin/settings', label: 'Настройки', icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden md:flex h-full w-56 shrink-0 flex-col border-r border-border bg-muted/40">
      <div className="flex h-14 items-center border-b border-border px-4">
        <Link href="/admin" className="text-base font-bold text-primary">
          CMS Admin
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
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

      <div className="border-t border-border p-2">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ExternalLink className="h-4 w-4 shrink-0" />
          На сайт
        </Link>
      </div>
    </aside>
  )
}
