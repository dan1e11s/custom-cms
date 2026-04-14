import { api } from './client'

export interface MediaItem {
  id: number
  filename: string
  originalName: string
  mimeType: string
  size: number
  url: string
  alt: string | null
  uploadedById: number
  uploadedBy: { id: number; username: string }
  createdAt: string
}

export interface MediaListResponse {
  items: MediaItem[]
  total: number
  page: number
  limit: number
  pages: number
}

export const mediaApi = {
  upload: (file: File) => {
    const fd = new FormData()
    fd.append('file', file)
    return api.upload<MediaItem>('/media/upload', fd)
  },

  getAll: (page = 1, limit = 24) =>
    api.get<MediaListResponse>(`/media?page=${page}&limit=${limit}`),

  updateAlt: (id: number, alt: string) => api.patch<MediaItem>(`/media/${id}`, { alt }),

  delete: (id: number) => api.delete<{ message: string }>(`/media/${id}`),
}
