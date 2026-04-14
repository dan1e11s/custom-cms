import { api } from './client'

// ── Dashboard ─────────────────────────────────────────────────────────────────

export type ActivityType = 'page' | 'blog_post' | 'user' | 'product' | 'gram_post'

export interface ActivityItem {
  type: ActivityType
  label: string
  createdAt: string
}

export interface ChartPoint {
  date: string
  posts: number
  users: number
}

export interface DashboardStats {
  pagesCount: number
  productsCount: number
  blogPostsCount: number
  usersCount: number
  gramPostsCount: number
  forumThreadsCount: number
}

export interface DashboardResponse {
  stats: DashboardStats
  recentActivity: ActivityItem[]
  chartData: ChartPoint[]
}

// ── Users ─────────────────────────────────────────────────────────────────────

export type UserRole = 'GUEST' | 'USER' | 'MODERATOR' | 'ADMIN'

export interface AdminUser {
  id: number
  username: string
  email: string
  role: UserRole
  avatar: string | null
  isActive: boolean
  createdAt: string
}

export interface UsersListResponse {
  items: AdminUser[]
  total: number
  page: number
  limit: number
  pages: number
}

// ── API ───────────────────────────────────────────────────────────────────────

export const adminApi = {
  getDashboard: () => api.get<DashboardResponse>('/admin/dashboard'),

  getUsers: (params: { search?: string; role?: string; page?: number; limit?: number }) => {
    const sp = new URLSearchParams()
    if (params.search) sp.set('search', params.search)
    if (params.role) sp.set('role', params.role)
    if (params.page) sp.set('page', String(params.page))
    if (params.limit) sp.set('limit', String(params.limit))
    return api.get<UsersListResponse>(`/admin/users?${sp}`)
  },

  changeRole: (id: number, role: UserRole) =>
    api.patch<AdminUser>(`/admin/users/${id}/role`, { role }),

  setActive: (id: number, isActive: boolean) =>
    api.patch<AdminUser>(`/admin/users/${id}/active`, { isActive }),
}
