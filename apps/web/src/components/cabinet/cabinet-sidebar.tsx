'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  ArrowLeft,
  Bell,
  FileText,
  LayoutDashboard,
  Menu,
  MessageCircle,
  MessageSquare,
  Shield,
  User,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
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

function NavList({ pathname }: { pathname: string }) {
  return (
    <ul className="space-y-0.5">
      {NAV_ITEMS.map(({ href, label, icon: Icon, exact }) => {
        const isActive = exact ? pathname === href : pathname.startsWith(href)
        return (
          <li key={href}>
            <Link
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-colors',
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
  )
}

export function CabinetSidebar() {
  const pathname = usePathname()

  return (
    <>
      {/* ── Десктоп (md+) ─────────────────────────────────────────────────── */}
      <aside className="hidden md:flex h-full w-56 shrink-0 flex-col border-r border-border bg-muted/40">
        <div className="flex h-14 items-center border-b border-border px-4">
          <Link href="/" className="flex items-center gap-1.5 text-sm font-semibold text-primary">
            <ArrowLeft className="h-4 w-4" />
            На сайт
          </Link>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          <p className="mb-1 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Кабинет
          </p>
          <nav>
            <NavList pathname={pathname} />
          </nav>
        </div>
      </aside>

      {/* ── Мобильная шапка (< md) ────────────────────────────────────────── */}
      <header className="flex md:hidden h-14 shrink-0 items-center justify-between border-b border-border bg-background px-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Меню кабинета</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-64 p-0">
            <div className="flex h-14 items-center border-b border-border px-4">
              <Link
                href="/"
                className="flex items-center gap-1.5 text-sm font-semibold text-primary"
              >
                <ArrowLeft className="h-4 w-4" />
                На сайт
              </Link>
            </div>
            <div className="p-3">
              <p className="mb-1 px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Кабинет
              </p>
              <NavList pathname={pathname} />
            </div>
          </SheetContent>
        </Sheet>

        <span className="font-semibold">Кабинет</span>

        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground">
          На сайт
        </Link>
      </header>
    </>
  )
}
