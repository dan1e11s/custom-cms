import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { authApi } from '@/lib/api/auth'
import { User } from '@/types/auth'

interface AuthStore {
  user: Pick<User, 'id' | 'email' | 'username' | 'role'> | null
  accessToken: string | null
  setUser: (user: AuthStore['user']) => void
  setToken: (token: string | null) => void
  logout: () => Promise<void>
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,

      setUser: (user) => set({ user }),

      setToken: (token) => {
        set({ accessToken: token })
        // Дублируем в cookie для серверных компонентов (SSR auth guard)
        if (typeof document !== 'undefined') {
          if (token) {
            document.cookie = `accessToken=${token}; path=/; max-age=900; SameSite=strict`
          } else {
            document.cookie = 'accessToken=; path=/; max-age=0'
          }
        }
      },

      logout: async () => {
        await authApi.logout().catch(() => null)
        set({ user: null, accessToken: null })
        if (typeof document !== 'undefined') {
          document.cookie = 'accessToken=; path=/; max-age=0'
        }
        window.location.href = '/login'
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user, accessToken: state.accessToken }),
    },
  ),
)
