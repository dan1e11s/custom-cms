import { serverApi } from './server'
import { api } from './client'
import type {
  ForumSection,
  ForumThread,
  ForumThreadsResponse,
  ForumPostsResponse,
  ForumPost,
} from '@/types/forum'

// ── Серверный (SSR/SSG) ───────────────────────────────────────────────────────

export const forumServerApi = {
  getSections: (opts?: Parameters<typeof serverApi.get>[1]) =>
    serverApi.get<ForumSection[]>('/forum/sections', opts),

  getSectionBySlug: (slug: string, opts?: Parameters<typeof serverApi.get>[1]) =>
    serverApi.get<ForumSection>(`/forum/sections/${slug}`, opts),

  getThreads: (
    sectionSlug: string,
    params: { page?: number; limit?: number },
    opts?: Parameters<typeof serverApi.get>[1],
  ) => {
    const q = new URLSearchParams()
    if (params.page) q.set('page', String(params.page))
    if (params.limit) q.set('limit', String(params.limit))
    return serverApi.get<ForumThreadsResponse>(
      `/forum/sections/${sectionSlug}/threads?${q.toString()}`,
      opts,
    )
  },

  getThreadBySlug: (slug: string, opts?: Parameters<typeof serverApi.get>[1]) =>
    serverApi.get<ForumThread>(`/forum/threads/${slug}`, opts),

  getPosts: (
    threadSlug: string,
    params: { page?: number; limit?: number },
    opts?: Parameters<typeof serverApi.get>[1],
  ) => {
    const q = new URLSearchParams()
    if (params.page) q.set('page', String(params.page))
    if (params.limit) q.set('limit', String(params.limit))
    return serverApi.get<ForumPostsResponse>(
      `/forum/threads/${threadSlug}/posts?${q.toString()}`,
      opts,
    )
  },
}

// ── Клиентский ────────────────────────────────────────────────────────────────

export const forumApi = {
  getSections: () => api.get<ForumSection[]>('/forum/sections'),

  getThreads: (sectionSlug: string, page = 1, limit = 20) =>
    api.get<ForumThreadsResponse>(
      `/forum/sections/${sectionSlug}/threads?page=${page}&limit=${limit}`,
    ),

  getPosts: (threadSlug: string, page = 1, limit = 20) =>
    api.get<ForumPostsResponse>(`/forum/threads/${threadSlug}/posts?page=${page}&limit=${limit}`),

  createThread: (data: { title: string; sectionId: number; content: string }) =>
    api.post<ForumThread>('/forum/threads', data),

  addPost: (threadId: number, data: { content: string; quotePostId?: number }) =>
    api.post<ForumPost>(`/forum/threads/${threadId}/posts`, data),

  deletePost: (postId: number) => api.delete<{ success: boolean }>(`/forum/posts/${postId}`),

  deleteThread: (threadId: number) =>
    api.delete<{ success: boolean }>(`/forum/threads/${threadId}`),
}

// ── Административный ─────────────────────────────────────────────────────────

export const forumAdminApi = {
  // Разделы
  createSection: (data: { title: string; slug?: string; description?: string; order?: number }) =>
    api.post<ForumSection>('/admin/forum/sections', data),

  updateSection: (
    id: number,
    data: { title?: string; slug?: string; description?: string; order?: number },
  ) => api.patch<ForumSection>(`/admin/forum/sections/${id}`, data),

  deleteSection: (id: number) => api.delete<{ success: boolean }>(`/admin/forum/sections/${id}`),

  // Управление темами
  pinLockThread: (id: number, data: { isPinned?: boolean; isLocked?: boolean }) =>
    api.patch<ForumThread>(`/admin/forum/threads/${id}/pin-lock`, data),

  deleteThread: (id: number) => api.delete<{ success: boolean }>(`/forum/threads/${id}`),
}
