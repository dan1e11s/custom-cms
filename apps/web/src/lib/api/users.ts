import { api } from './client'
import type { User } from '@/types/auth'
import type { GramPost } from '@/types/gram'

export interface MyComment {
  id: number
  content: string
  createdAt: string
  parentId: number | null
  gramPost: { id: number; content: string } | null
  blogPost: { id: number; title: string; slug: string } | null
}

export interface MyForumThread {
  id: number
  slug: string
  title: string
  createdAt: string
  lastPostAt: string
  section: { id: number; slug: string; title: string }
  _count: { posts: number }
}

export interface MyForumPost {
  id: number
  content: string
  createdAt: string
  thread: { id: number; title: string; slug: string; section: { slug: string } }
}

export interface MyForumActivity {
  threads: MyForumThread[]
  posts: MyForumPost[]
}

export interface UpdateProfileInput {
  username?: string
  bio?: string
}

export interface ChangePasswordInput {
  currentPassword: string
  newPassword: string
}

export const usersApi = {
  getMe: () => api.get<User>('/users/me'),

  updateMe: (dto: UpdateProfileInput) => api.patch<User>('/users/me', dto),

  uploadAvatar: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.upload<User>('/users/me/avatar', fd)
  },

  changePassword: (dto: ChangePasswordInput) =>
    api.patch<{ success: boolean }>('/users/me/password', dto),

  getMyPosts: () => api.get<GramPost[]>('/users/me/posts'),

  getMyComments: () => api.get<MyComment[]>('/users/me/comments'),

  getMyForum: () => api.get<MyForumActivity>('/users/me/forum'),
}
