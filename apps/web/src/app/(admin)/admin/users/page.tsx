'use client'

import { useCallback, useEffect, useState } from 'react'
import { Search, Shield, ShieldAlert, ShieldCheck, ShieldOff, UserX } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { adminApi } from '@/lib/api/admin'
import type { AdminUser, UserRole } from '@/lib/api/admin'
import { cn } from '@/lib/utils'

// ── Конфиг ролей ─────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<UserRole, { label: string; className: string }> = {
  GUEST: { label: 'Гость', className: 'bg-muted text-muted-foreground' },
  USER: { label: 'Пользователь', className: 'bg-blue-500/10 text-blue-600' },
  MODERATOR: { label: 'Модератор', className: 'bg-orange-500/10 text-orange-600' },
  ADMIN: { label: 'Администратор', className: 'bg-red-500/10 text-red-600' },
}

const ROLES: UserRole[] = ['GUEST', 'USER', 'MODERATOR', 'ADMIN']

const ROLE_FILTERS = [
  { value: '', label: 'Все роли' },
  { value: 'USER', label: 'Пользователи' },
  { value: 'MODERATOR', label: 'Модераторы' },
  { value: 'ADMIN', label: 'Администраторы' },
]

// ── Форматирование даты ───────────────────────────────────────────────────────

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

// ── Компонент строки таблицы ─────────────────────────────────────────────────

function UserRow({
  user,
  selected,
  onSelect,
  onUpdate,
}: {
  user: AdminUser
  selected: boolean
  onSelect: (id: number, checked: boolean) => void
  onUpdate: (updated: AdminUser) => void
}) {
  const [loading, setLoading] = useState(false)

  const handleRoleChange = async (role: UserRole) => {
    if (role === user.role) return
    setLoading(true)
    try {
      const updated = await adminApi.changeRole(user.id, role)
      onUpdate(updated)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }

  const handleToggleActive = async () => {
    setLoading(true)
    try {
      const updated = await adminApi.setActive(user.id, !user.isActive)
      onUpdate(updated)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }

  const roleConfig = ROLE_CONFIG[user.role]

  return (
    <tr
      className={cn(
        'border-b border-border transition-colors hover:bg-muted/40',
        !user.isActive && 'opacity-60',
      )}
    >
      {/* Чекбокс */}
      <td className="w-10 px-3 py-3">
        <input
          type="checkbox"
          checked={selected}
          onChange={(e) => onSelect(user.id, e.target.checked)}
          className="h-4 w-4 rounded border-border"
        />
      </td>

      {/* Аватар + имя */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-xs font-bold uppercase text-primary">
            {user.avatar ? (
              <img src={user.avatar} alt={user.username} className="h-8 w-8 object-cover" />
            ) : (
              user.username[0]
            )}
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">@{user.username}</p>
            <p className="truncate text-xs text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </td>

      {/* Роль */}
      <td className="px-3 py-3">
        <span
          className={cn(
            'inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium',
            roleConfig.className,
          )}
        >
          {roleConfig.label}
        </span>
      </td>

      {/* Статус */}
      <td className="px-3 py-3">
        <span
          className={cn(
            'inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium',
            user.isActive ? 'bg-green-500/10 text-green-600' : 'bg-destructive/10 text-destructive',
          )}
        >
          <span
            className={cn(
              'h-1.5 w-1.5 rounded-full',
              user.isActive ? 'bg-green-500' : 'bg-destructive',
            )}
          />
          {user.isActive ? 'Активен' : 'Заблокирован'}
        </span>
      </td>

      {/* Дата регистрации */}
      <td className="px-3 py-3 text-sm text-muted-foreground">{formatDate(user.createdAt)}</td>

      {/* Действия */}
      <td className="px-3 py-3">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" disabled={loading} className="h-7 px-2 text-xs">
              Действия ▾
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Изменить роль
            </DropdownMenuLabel>
            {ROLES.map((r) => (
              <DropdownMenuItem
                key={r}
                onClick={() => handleRoleChange(r)}
                className={cn('text-sm', user.role === r && 'font-semibold')}
              >
                {r === 'ADMIN' && <ShieldAlert className="mr-2 h-3.5 w-3.5 text-red-500" />}
                {r === 'MODERATOR' && <ShieldCheck className="mr-2 h-3.5 w-3.5 text-orange-500" />}
                {r === 'USER' && <Shield className="mr-2 h-3.5 w-3.5 text-blue-500" />}
                {r === 'GUEST' && <ShieldOff className="mr-2 h-3.5 w-3.5" />}
                {ROLE_CONFIG[r].label}
                {user.role === r && ' ✓'}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={handleToggleActive}
              className={
                user.isActive
                  ? 'text-destructive focus:text-destructive'
                  : 'text-green-600 focus:text-green-600'
              }
            >
              <UserX className="mr-2 h-3.5 w-3.5" />
              {user.isActive ? 'Заблокировать' : 'Разблокировать'}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </td>
    </tr>
  )
}

// ── Главный компонент ─────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([])
  const [total, setTotal] = useState(0)
  const [pages, setPages] = useState(1)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const [search, setSearch] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [roleFilter, setRoleFilter] = useState('')

  const [selected, setSelected] = useState<Set<number>>(new Set())
  const [bulkLoading, setBulkLoading] = useState(false)

  const LIMIT = 20

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await adminApi.getUsers({ search, role: roleFilter, page, limit: LIMIT })
      setUsers(data.items)
      setTotal(data.total)
      setPages(data.pages)
    } catch {
      /* ignore */
    } finally {
      setLoading(false)
    }
  }, [search, roleFilter, page])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // Сброс выделения при смене фильтра/страницы
  useEffect(() => {
    setSelected(new Set())
  }, [search, roleFilter, page])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setSearch(searchInput)
    setPage(1)
  }

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role)
    setPage(1)
  }

  const handleSelect = (id: number, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      checked ? next.add(id) : next.delete(id)
      return next
    })
  }

  const handleSelectAll = (checked: boolean) => {
    setSelected(checked ? new Set(users.map((u) => u.id)) : new Set())
  }

  const handleUserUpdate = (updated: AdminUser) => {
    setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
  }

  // Массовые действия
  const handleBulkActive = async (isActive: boolean) => {
    if (selected.size === 0) return
    setBulkLoading(true)
    try {
      await Promise.all(Array.from(selected).map((id) => adminApi.setActive(id, isActive)))
      setUsers((prev) => prev.map((u) => (selected.has(u.id) ? { ...u, isActive } : u)))
      setSelected(new Set())
    } catch {
      /* ignore */
    } finally {
      setBulkLoading(false)
    }
  }

  const allSelected = users.length > 0 && selected.size === users.length

  return (
    <div className="space-y-5">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Пользователи</h1>
          <p className="text-sm text-muted-foreground">{total} всего</p>
        </div>
      </div>

      {/* Фильтры */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Поиск */}
        <form onSubmit={handleSearch} className="flex gap-2 flex-1 max-w-sm">
          <div className="relative flex-1">
            <Search className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Поиск по имени или email..."
              className="pl-8"
            />
          </div>
          <Button type="submit" size="sm">
            Найти
          </Button>
        </form>

        {/* Фильтр по роли */}
        <div className="flex gap-1.5">
          {ROLE_FILTERS.map(({ value, label }) => (
            <button
              key={value}
              onClick={() => handleRoleFilter(value)}
              className={cn(
                'rounded-md px-3 py-1.5 text-xs font-medium transition-colors',
                roleFilter === value
                  ? 'bg-primary text-primary-foreground'
                  : 'border border-border text-muted-foreground hover:bg-muted',
              )}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Панель массовых действий */}
      {selected.size > 0 && (
        <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/50 px-4 py-2.5">
          <span className="text-sm font-medium">Выбрано: {selected.size}</span>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkActive(false)}
              disabled={bulkLoading}
              className="text-destructive hover:text-destructive"
            >
              Заблокировать
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleBulkActive(true)}
              disabled={bulkLoading}
              className="text-green-600 hover:text-green-600"
            >
              Разблокировать
            </Button>
          </div>
          <button
            onClick={() => setSelected(new Set())}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground"
          >
            Снять выделение
          </button>
        </div>
      )}

      {/* Таблица */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="w-10 px-3 py-3">
                  <input
                    type="checkbox"
                    checked={allSelected}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    className="h-4 w-4 rounded border-border"
                  />
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Пользователь
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Роль
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Статус
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Дата регистрации
                </th>
                <th className="px-3 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Действия
                </th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    Загрузка...
                  </td>
                </tr>
              )}
              {!loading && users.length === 0 && (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-muted-foreground">
                    Пользователи не найдены
                  </td>
                </tr>
              )}
              {!loading &&
                users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    selected={selected.has(user.id)}
                    onSelect={handleSelect}
                    onUpdate={handleUserUpdate}
                  />
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Пагинация */}
      {pages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Страница {page} из {pages} ({total} записей)
          </p>
          <div className="flex gap-1.5">
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              ← Назад
            </Button>
            {Array.from({ length: Math.min(pages, 5) }, (_, i) => {
              const p = page <= 3 ? i + 1 : page - 2 + i
              if (p < 1 || p > pages) return null
              return (
                <Button
                  key={p}
                  size="sm"
                  variant={p === page ? 'default' : 'outline'}
                  onClick={() => setPage(p)}
                >
                  {p}
                </Button>
              )
            })}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setPage((p) => Math.min(pages, p + 1))}
              disabled={page === pages}
            >
              Вперёд →
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
