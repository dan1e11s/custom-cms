'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, LogOut, Menu, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { NotificationBell } from './NotificationBell'
import { useAuthStore } from '@/store/auth.store'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { href: '/catalog', label: 'Каталог' },
  { href: '/blog', label: 'Блог' },
  { href: '/forum', label: 'Форум' },
  { href: '/gram', label: 'Грам' },
]

export function Header() {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="text-xl font-bold text-primary">
            CMS Platform
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-6 md:flex">
            {NAV_LINKS.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  pathname.startsWith(href) ? 'text-primary' : 'text-muted-foreground',
                )}
              >
                {label}
              </Link>
            ))}
          </nav>

          {/* Desktop right side */}
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                {/* Колокольчик уведомлений */}
                <NotificationBell />

                {/* Меню пользователя */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex h-9 items-center gap-2 rounded-md px-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground">
                      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold uppercase text-primary">
                        {user.username[0]}
                      </span>
                      <span className="max-w-[100px] truncate">@{user.username}</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem asChild>
                      <Link href="/cabinet" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Личный кабинет
                      </Link>
                    </DropdownMenuItem>
                    {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="flex items-center gap-2">
                          <LayoutDashboard className="h-4 w-4" />
                          Админ-панель
                        </Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={logout}
                      className="flex items-center gap-2 text-destructive focus:text-destructive"
                    >
                      <LogOut className="h-4 w-4" />
                      Выйти
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                <Button variant="ghost" asChild>
                  <Link href="/login">Войти</Link>
                </Button>
                <Button asChild>
                  <Link href="/register">Регистрация</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile burger */}
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Открыть меню</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-72">
              <Link href="/" className="mb-6 block text-xl font-bold text-primary">
                CMS Platform
              </Link>
              <nav className="flex flex-col gap-4">
                {NAV_LINKS.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'text-sm font-medium transition-colors hover:text-primary',
                      pathname.startsWith(href) ? 'text-primary' : 'text-muted-foreground',
                    )}
                  >
                    {label}
                  </Link>
                ))}
                <hr className="border-border" />
                {user ? (
                  <>
                    <Link href="/cabinet" className="text-sm font-medium hover:text-primary">
                      Личный кабинет
                    </Link>
                    {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
                      <Link href="/admin" className="text-sm font-medium hover:text-primary">
                        Админ-панель
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="text-left text-sm font-medium text-destructive hover:opacity-80"
                    >
                      Выйти
                    </button>
                  </>
                ) : (
                  <>
                    <Link href="/login" className="text-sm font-medium hover:text-primary">
                      Войти
                    </Link>
                    <Link href="/register" className="text-sm font-medium hover:text-primary">
                      Регистрация
                    </Link>
                  </>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </Container>
    </header>
  )
}
