import { api } from './client'

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

export const adminApi = {
  getDashboard: () => api.get<DashboardResponse>('/admin/dashboard'),
}
