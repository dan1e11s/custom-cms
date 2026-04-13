import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      retry: (failureCount, error: unknown) => {
        const e = error as { status?: number }
        if (e?.status === 401 || e?.status === 403) return false
        return failureCount < 2
      },
    },
  },
})
