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

/**
 * Читает access token из localStorage (Zustand persist key 'auth-storage').
 * Нужно, чтобы каждый запрос включал Authorization: Bearer <token> —
 * некоторые бэкенды не принимают JWT из cookie, только из заголовка.
 */
function getStoredToken(): string | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem('auth-storage')
    if (!raw) return null
    const parsed = JSON.parse(raw) as { state?: { accessToken?: string | null } }
    return parsed?.state?.accessToken ?? null
  } catch {
    return null
  }
}

/** Обновляет accessToken в localStorage после успешного refresh */
function updateStoredToken(token: string): void {
  if (typeof window === 'undefined') return
  try {
    const raw = localStorage.getItem('auth-storage')
    if (!raw) return
    const parsed = JSON.parse(raw)
    if (parsed?.state) {
      parsed.state.accessToken = token
      localStorage.setItem('auth-storage', JSON.stringify(parsed))
    }
  } catch {
    // ignore
  }
}

async function fetchApi<T>(
  endpoint: string,
  options: RequestInit & { suppressLogout?: boolean } = {},
): Promise<T> {
  const { suppressLogout = false, ...fetchOptions } = options
  const token = getStoredToken()

  // FormData: не устанавливаем Content-Type — браузер сам добавит boundary
  const isFormData = fetchOptions.body instanceof FormData

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...fetchOptions,
    headers: {
      ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
      // Всегда добавляем токен в заголовок — стандартный JWT-подход
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // Явные заголовки из options перезаписывают авто-генерированные
      ...fetchOptions.headers,
    },
    credentials: 'include',
  })

  if (res.status === 401) {
    // Пробуем обновить токен
    const refreshed = await tryRefresh()
    if (refreshed) {
      // Сохраняем новый токен в localStorage
      updateStoredToken(refreshed)

      // Повторяем запрос с новым токеном
      const retryRes = await fetch(`${BASE_URL}${endpoint}`, {
        ...fetchOptions,
        headers: {
          ...(!isFormData ? { 'Content-Type': 'application/json' } : {}),
          Authorization: `Bearer ${refreshed}`,
          ...fetchOptions.headers,
        },
        credentials: 'include',
      })

      if (retryRes.ok) {
        return retryRes.status === 204 ? (undefined as T) : retryRes.json()
      }
    }

    // Refresh не помог — редиректим на логин (если не подавлено)
    if (!suppressLogout && typeof window !== 'undefined') {
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

  post: <T>(url: string, body: unknown, opts?: RequestInit & { suppressLogout?: boolean }) =>
    fetchApi<T>(url, { method: 'POST', body: JSON.stringify(body), ...opts }),

  patch: <T>(url: string, body: unknown, opts?: RequestInit & { suppressLogout?: boolean }) =>
    fetchApi<T>(url, { method: 'PATCH', body: JSON.stringify(body), ...opts }),

  delete: <T>(url: string, opts?: RequestInit) => fetchApi<T>(url, { method: 'DELETE', ...opts }),

  upload: <T>(url: string, formData: FormData, token?: string) =>
    fetchApi<T>(url, {
      method: 'POST',
      body: formData,
      // При явном токене — переопределяем авто-генерированный
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    }),
}
