/**
 * Серверный API-клиент для использования в Server Components (SSG/ISR/SSR).
 * Не содержит браузерной логики. Поддерживает next/cache теги и revalidate.
 */

const BASE_URL = process.env.NEXT_PUBLIC_API_URL

export class ServerApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message)
    this.name = 'ServerApiError'
  }
}

interface FetchOptions extends RequestInit {
  tags?: string[]
  revalidate?: number | false
}

async function serverFetch<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { tags, revalidate, ...rest } = options

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...rest.headers,
    },
    next: {
      ...(tags ? { tags } : {}),
      ...(revalidate !== undefined ? { revalidate } : {}),
    },
  })

  if (!res.ok) {
    const body = await res.json().catch(() => ({ message: res.statusText }))
    throw new ServerApiError(res.status, body.message ?? 'Server error')
  }

  return res.json()
}

export const serverApi = {
  get: <T>(url: string, opts?: FetchOptions) => serverFetch<T>(url, opts),
}
