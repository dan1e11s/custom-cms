import { cookies } from 'next/headers'
import { User } from '@/types/auth'

export async function getCurrentUser(): Promise<Pick<
  User,
  'id' | 'email' | 'username' | 'role'
> | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('accessToken')?.value

  if (!token) return null

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    })
    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}
