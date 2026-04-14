'use client'

import { useEffect, useState } from 'react'
import { BookOpen, FileText, Instagram, MessageCircle, ShoppingBag, Users } from 'lucide-react'
import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { adminApi } from '@/lib/api/admin'
import type { ActivityItem, ChartPoint, DashboardStats } from '@/lib/api/admin'

// ── Маппинг иконок активности ─────────────────────────────────────────────────

const ACTIVITY_CONFIG: Record<ActivityItem['type'], { icon: string; color: string }> = {
  page: { icon: '📄', color: 'bg-blue-500/10 text-blue-600' },
  blog_post: { icon: '📖', color: 'bg-purple-500/10 text-purple-600' },
  user: { icon: '👤', color: 'bg-green-500/10 text-green-600' },
  product: { icon: '🛒', color: 'bg-orange-500/10 text-orange-600' },
  gram_post: { icon: '📸', color: 'bg-pink-500/10 text-pink-600' },
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

// ── Стат-карточки ─────────────────────────────────────────────────────────────

const STAT_CARDS = [
  {
    key: 'pagesCount' as const,
    label: 'Страниц',
    icon: FileText,
    color: 'text-blue-600',
    bg: 'bg-blue-500/10',
  },
  {
    key: 'productsCount' as const,
    label: 'Товаров',
    icon: ShoppingBag,
    color: 'text-orange-600',
    bg: 'bg-orange-500/10',
  },
  {
    key: 'blogPostsCount' as const,
    label: 'Статей',
    icon: BookOpen,
    color: 'text-purple-600',
    bg: 'bg-purple-500/10',
  },
  {
    key: 'usersCount' as const,
    label: 'Пользователей',
    icon: Users,
    color: 'text-green-600',
    bg: 'bg-green-500/10',
  },
  {
    key: 'gramPostsCount' as const,
    label: 'Постов в Граме',
    icon: Instagram,
    color: 'text-pink-600',
    bg: 'bg-pink-500/10',
  },
  {
    key: 'forumThreadsCount' as const,
    label: 'Тем форума',
    icon: MessageCircle,
    color: 'text-cyan-600',
    bg: 'bg-cyan-500/10',
  },
]

// ── Компонент ─────────────────────────────────────────────────────────────────

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [activity, setActivity] = useState<ActivityItem[]>([])
  const [chartData, setChartData] = useState<ChartPoint[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    adminApi
      .getDashboard()
      .then((data) => {
        setStats(data.stats)
        setActivity(data.recentActivity)
        setChartData(data.chartData)
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const today = new Date().toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  return (
    <div className="space-y-6">
      {/* Заголовок */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Дашборд</h1>
        <span className="text-sm text-muted-foreground">{today}</span>
      </div>

      {/* Стат-карточки */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
        {STAT_CARDS.map(({ key, label, icon: Icon, color, bg }) => (
          <div key={key} className="rounded-xl border border-border bg-card p-4 space-y-3">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg}`}>
              <Icon className={`h-4 w-4 ${color}`} />
            </div>
            <div>
              <p className="text-2xl font-bold">
                {loading ? '—' : (stats?.[key] ?? 0).toLocaleString('ru-RU')}
              </p>
              <p className="text-xs text-muted-foreground">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Нижний блок: график + активность */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* График */}
        <div className="xl:col-span-2 rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            Активность за 14 дней
          </h2>

          {loading ? (
            <div className="flex h-52 items-center justify-center text-muted-foreground text-sm">
              Загрузка...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorPosts" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ec4899" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorUsers" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis
                  dataKey="date"
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))' }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip
                  contentStyle={{
                    background: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  iconSize={8}
                  iconType="circle"
                  wrapperStyle={{ fontSize: '12px', paddingTop: '12px' }}
                />
                <Area
                  type="monotone"
                  dataKey="posts"
                  name="Посты Грама"
                  stroke="#ec4899"
                  strokeWidth={2}
                  fill="url(#colorPosts)"
                  dot={false}
                />
                <Area
                  type="monotone"
                  dataKey="users"
                  name="Новые пользователи"
                  stroke="#22c55e"
                  strokeWidth={2}
                  fill="url(#colorUsers)"
                  dot={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Последние действия */}
        <div className="rounded-xl border border-border bg-card p-5">
          <h2 className="mb-4 font-semibold text-sm text-muted-foreground uppercase tracking-wider">
            Последние действия
          </h2>

          {loading && (
            <div className="py-8 text-center text-sm text-muted-foreground">Загрузка...</div>
          )}

          {!loading && activity.length === 0 && (
            <div className="py-8 text-center text-sm text-muted-foreground">Нет активности</div>
          )}

          <ul className="space-y-3">
            {activity.map((item, idx) => {
              const cfg = ACTIVITY_CONFIG[item.type]
              return (
                <li key={idx} className="flex items-start gap-3">
                  <span
                    className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm ${cfg.color}`}
                  >
                    {cfg.icon}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm leading-snug line-clamp-2">{item.label}</p>
                    <time className="text-xs text-muted-foreground">{timeAgo(item.createdAt)}</time>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </div>
  )
}
