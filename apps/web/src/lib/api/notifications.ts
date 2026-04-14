import { api } from './client'
import type { Notification, UnreadCountResponse } from '@/types/notification'

export const notificationsApi = {
  getAll: (limit = 30) => api.get<Notification[]>(`/notifications?limit=${limit}`),

  getUnreadCount: () => api.get<UnreadCountResponse>('/notifications/unread-count'),

  markAllRead: () => api.patch<{ success: boolean }>('/notifications/read-all', {}),

  markRead: (id: number) => api.patch<{ success: boolean }>(`/notifications/${id}/read`, {}),

  deleteAll: () => api.delete<{ success: boolean }>('/notifications'),
}
