import { serverApi } from './server'
import { api } from './client'
import type { GramPost, GramFeedResponse, GramComment, LikeStatus } from '@/types/gram'

// ── Серверный (SSR/ISR — первая порция для SEO) ───────────────────────────────

export const gramServerApi = {
  getFeed: (limit = 20, opts?: Parameters<typeof serverApi.get>[1]) =>
    serverApi.get<GramFeedResponse>(`/gram/posts?limit=${limit}`, opts),
}

// ── Клиентский ────────────────────────────────────────────────────────────────

export const gramApi = {
  getFeed: (cursor?: number, limit = 20) =>
    api.get<GramFeedResponse>(
      `/gram/posts?limit=${limit}${cursor !== undefined ? `&cursor=${cursor}` : ''}`,
    ),

  getPostById: (id: number) => api.get<GramPost>(`/gram/posts/${id}`),

  getComments: (id: number) => api.get<GramComment[]>(`/gram/posts/${id}/comments`),

  getPostsByTag: (tag: string) => api.get<GramPost[]>(`/gram/tags/${tag}`),

  createPost: (data: { content: string; images?: string[] }) =>
    api.post<GramPost>('/gram/posts', data),

  deletePost: (id: number) => api.delete<{ success: boolean }>(`/gram/posts/${id}`),

  toggleLike: (id: number) => api.post<LikeStatus>(`/gram/posts/${id}/like`, {}),

  getLikeStatus: (id: number) => api.get<LikeStatus>(`/gram/posts/${id}/like`),

  addComment: (id: number, data: { content: string; parentId?: number }) =>
    api.post<GramComment>(`/gram/posts/${id}/comments`, data),
}
