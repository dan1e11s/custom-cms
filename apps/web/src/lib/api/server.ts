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

  // Если явно заданы теги или revalidate — используем Next.js Data Cache.
  // Иначе: cache: 'no-store' чтобы данные всегда приходили свежими из бекенда.
  // Передача next: {} без revalidate активирует кэш по умолчанию (force-cache),
  // что приводит к отображению устаревших данных даже на force-dynamic страницах.
  const hasCacheConfig = tags?.length || revalidate !== undefined

  const res = await fetch(`${BASE_URL}${endpoint}`, {
    ...rest,
    headers: {
      'Content-Type': 'application/json',
      ...rest.headers,
    },
    ...(hasCacheConfig
      ? {
          next: {
            ...(tags ? { tags } : {}),
            ...(revalidate !== undefined ? { revalidate } : {}),
          },
        }
      : { cache: 'no-store' }),
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
