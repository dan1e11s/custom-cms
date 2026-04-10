const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    credentials: 'include',
  })

  if (res.status === 401) {
    // Пробуем обновить токен
    const refreshed = await tryRefresh()
    if (refreshed) {
      // Повторяем оригинальный запрос с новым токеном
      const retryRes = await fetch(`${BASE_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${refreshed}`,
          ...options.headers,
        },
        credentials: 'include',
      })

      if (retryRes.ok) {
        return retryRes.status === 204 ? (undefined as T) : retryRes.json()
      }
    }

    // Refresh не помог — редиректим на логин (только в браузере)
    if (typeof window !== 'undefined') {
      window.location.href = '/login'
    }
    throw new ApiError(401, 'Unauthorized')
  }

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }))
    throw new ApiError(res.status, body.message ?? 'Unexpected error')
  }

  if (res.status === 204) return undefined as T
  return res.json()
}

async function tryRefresh(): Promise<string | null> {
  try {
    const res = await fetch(`${BASE_URL}/auth/refresh`, {
      method: 'POST',
      credentials: 'include',
    })
    if (!res.ok) return null
    const data = await res.json()
    return data.accessToken ?? null
  } catch {
    return null
  }
}

export const api = {
  get: <T>(url: string, opts?: RequestInit) => fetchApi<T>(url, opts),

  post: <T>(url: string, body: unknown, opts?: RequestInit) =>
    fetchApi<T>(url, { method: 'POST', body: JSON.stringify(body), ...opts }),

  patch: <T>(url: string, body: unknown, opts?: RequestInit) =>
    fetchApi<T>(url, { method: 'PATCH', body: JSON.stringify(body), ...opts }),

  delete: <T>(url: string, opts?: RequestInit) => fetchApi<T>(url, { method: 'DELETE', ...opts }),

  upload: <T>(url: string, formData: FormData, token?: string) =>
    fetchApi<T>(url, {
      method: 'POST',
      body: formData,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
}
