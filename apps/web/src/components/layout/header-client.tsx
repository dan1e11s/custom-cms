'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { ChevronDown, LayoutDashboard, LogOut, Menu, User } from 'lucide-react'
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
import type { NavItem, SiteSettings } from '@/lib/api/site'

interface Props {
  navItems: NavItem[]
  settings: SiteSettings | null
}

export function HeaderClient({ navItems, settings }: Props) {
  const pathname = usePathname()
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const [expandedMobileItem, setExpandedMobileItem] = useState<number | null>(null)

  const logoText = settings?.logoText || settings?.siteName || 'CMS Platform'

  function isActive(href: string | null) {
    if (!href) return false
    return pathname.startsWith(href)
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between">
          {/* Логотип */}
          <Link href="/" className="flex items-center">
            {settings?.logoUrl ? (
              <Image
                src={settings.logoUrl}
                alt={logoText}
                width={140}
                height={40}
                className="h-9 w-auto object-contain"
                priority
              />
            ) : (
              <span className="text-xl font-bold text-primary">{logoText}</span>
            )}
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-1 md:flex">
            {navItems.map((item) => {
              if (!item.isVisible) return null
              const hasChildren = item.children.length > 0
              const active = isActive(item.href)

              if (hasChildren) {
                return (
                  <DropdownMenu key={item.id}>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          'flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary',
                          active ? 'text-primary' : 'text-muted-foreground',
                        )}
                      >
                        {item.label}
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="min-w-[180px]">
                      {item.href && (
                        <>
                          <DropdownMenuItem asChild>
                            <Link
                              href={item.href}
                              target={item.openInNewTab ? '_blank' : undefined}
                              className="font-medium"
                            >
                              Все — {item.label}
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      {item.children
                        .filter((c) => c.isVisible)
                        .map((child) => (
                          <DropdownMenuItem key={child.id} asChild>
                            <Link
                              href={child.href || '#'}
                              target={child.openInNewTab ? '_blank' : undefined}
                            >
                              <div>
                                <div>{child.label}</div>
                                {child.description && (
                                  <div className="text-xs text-muted-foreground">
                                    {child.description}
                                  </div>
                                )}
                              </div>
                            </Link>
                          </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              }

              return (
                <Link
                  key={item.id}
                  href={item.href || '#'}
                  target={item.openInNewTab ? '_blank' : undefined}
                  className={cn(
                    'rounded-md px-3 py-2 text-sm font-medium transition-colors hover:text-primary',
                    active ? 'text-primary' : 'text-muted-foreground',
                  )}
                >
                  {item.label}
                </Link>
              )
            })}
          </nav>

          {/* Desktop right side */}
          <div className="hidden items-center gap-2 md:flex">
            {user ? (
              <>
                <NotificationBell />
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
              <Link href="/" className="mb-6 block">
                {settings?.logoUrl ? (
                  <Image
                    src={settings.logoUrl}
                    alt={logoText}
                    width={120}
                    height={36}
                    className="h-8 w-auto object-contain"
                  />
                ) : (
                  <span className="text-xl font-bold text-primary">{logoText}</span>
                )}
              </Link>

              <nav className="flex flex-col gap-1">
                {navItems.map((item) => {
                  if (!item.isVisible) return null
                  const hasChildren = item.children.filter((c) => c.isVisible).length > 0

                  if (hasChildren) {
                    const expanded = expandedMobileItem === item.id
                    return (
                      <div key={item.id}>
                        <button
                          onClick={() => setExpandedMobileItem(expanded ? null : item.id)}
                          className={cn(
                            'flex w-full items-center justify-between rounded-md px-2 py-2 text-sm font-medium hover:bg-muted',
                            isActive(item.href) ? 'text-primary' : 'text-muted-foreground',
                          )}
                        >
                          {item.label}
                          <ChevronDown
                            className={cn(
                              'h-3.5 w-3.5 transition-transform',
                              expanded && 'rotate-180',
                            )}
                          />
                        </button>
                        {expanded && (
                          <div className="ml-3 mt-0.5 flex flex-col gap-0.5">
                            {item.href && (
                              <Link
                                href={item.href}
                                className="rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-primary"
                              >
                                Все — {item.label}
                              </Link>
                            )}
                            {item.children
                              .filter((c) => c.isVisible)
                              .map((child) => (
                                <Link
                                  key={child.id}
                                  href={child.href || '#'}
                                  target={child.openInNewTab ? '_blank' : undefined}
                                  className="rounded-md px-2 py-1.5 text-sm text-muted-foreground hover:text-primary"
                                >
                                  {child.label}
                                </Link>
                              ))}
                          </div>
                        )}
                      </div>
                    )
                  }

                  return (
                    <Link
                      key={item.id}
                      href={item.href || '#'}
                      target={item.openInNewTab ? '_blank' : undefined}
                      className={cn(
                        'rounded-md px-2 py-2 text-sm font-medium hover:bg-muted hover:text-foreground',
                        isActive(item.href) ? 'text-primary' : 'text-muted-foreground',
                      )}
                    >
                      {item.label}
                    </Link>
                  )
                })}

                <hr className="my-2 border-border" />

                {user ? (
                  <>
                    <Link
                      href="/cabinet"
                      className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted"
                    >
                      Личный кабинет
                    </Link>
                    {(user.role === 'ADMIN' || user.role === 'MODERATOR') && (
                      <Link
                        href="/admin"
                        className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted"
                      >
                        Админ-панель
                      </Link>
                    )}
                    <button
                      onClick={logout}
                      className="rounded-md px-2 py-2 text-left text-sm font-medium text-destructive hover:bg-muted"
                    >
                      Выйти
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted"
                    >
                      Войти
                    </Link>
                    <Link
                      href="/register"
                      className="rounded-md px-2 py-2 text-sm font-medium hover:bg-muted"
                    >
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
