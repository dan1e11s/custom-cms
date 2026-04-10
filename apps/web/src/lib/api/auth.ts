import { AuthResponse, RegisterResponse } from '@/types/auth'
import { api } from './client'

export const authApi = {
  register: (data: { email: string; username: string; password: string }) =>
    api.post<RegisterResponse>('/auth/register', data),

  login: (data: { email: string; password: string }) => api.post<AuthResponse>('/auth/login', data),

  logout: () => api.post<{ message: string }>('/auth/logout', {}),

  me: () => api.get<AuthResponse['user']>('/users/me'),
}
