import { serverApi } from './server'
import { api } from './client'
import type { BlogPost, BlogListResponse, BlogTag, BlogCategory, BlogComment } from '@/types/blog'

export interface BlogQueryParams {
  search?: string
  categorySlug?: string
  tag?: string
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: string
}

function buildQueryString(params: BlogQueryParams): string {
  const entries = (Object.entries(params) as [string, string | number | undefined][]).filter(
    ([, v]) => v !== undefined && v !== '',
  )
  if (!entries.length) return ''
  return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&')
}

// ── Серверный (Server Components, SSG, ISR) ───────────────────────────────────

export const blogServerApi = {
  getPosts: (params: BlogQueryParams = {}, opts?: Parameters<typeof serverApi.get>[1]) =>
    serverApi.get<BlogListResponse>(`/blog/posts${buildQueryString(params)}`, opts),

  getPostBySlug: (slug: string, opts?: Parameters<typeof serverApi.get>[1]) =>
    serverApi.get<BlogPost>(`/blog/posts/${slug}`, opts),

  getTags: (opts?: Parameters<typeof serverApi.get>[1]) =>
    serverApi.get<BlogTag[]>('/blog/tags', opts),

  getCategories: (opts?: Parameters<typeof serverApi.get>[1]) =>
    serverApi.get<BlogCategory[]>('/blog/categories', opts),
}

// ── Клиентский (CSR, Admin) ───────────────────────────────────────────────────

export const blogApi = {
  getComments: (slug: string) => api.get<BlogComment[]>(`/blog/posts/${slug}/comments`),

  addComment: (slug: string, data: { content: string; parentId?: number }) =>
    api.post<BlogComment>(`/blog/posts/${slug}/comments`, data),

  // Admin
  getAllPosts: (params: BlogQueryParams = {}) =>
    api.get<BlogListResponse>(`/admin/blog/posts${buildQueryString(params)}`),

  getPostById: (id: number) => api.get<BlogPost>(`/admin/blog/posts/${id}`),

  createPost: (data: Partial<BlogPost> & { tags?: string[]; content: string; title: string }) =>
    api.post<BlogPost>('/admin/blog/posts', data),

  updatePost: (id: number, data: Partial<BlogPost> & { tags?: string[] }) =>
    api.patch<BlogPost>(`/admin/blog/posts/${id}`, data),

  publishPost: (id: number) => api.patch<BlogPost>(`/admin/blog/posts/${id}/publish`, {}),

  unpublishPost: (id: number) => api.patch<BlogPost>(`/admin/blog/posts/${id}/unpublish`, {}),

  schedulePost: (id: number, publishAt: string) =>
    api.patch<BlogPost>(`/admin/blog/posts/${id}/schedule`, { publishAt }),

  deletePost: (id: number) => api.delete<{ success: boolean }>(`/admin/blog/posts/${id}`),
}
