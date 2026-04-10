export type Role = 'GUEST' | 'USER' | 'MODERATOR' | 'ADMIN'

export interface User {
  id: number
  email: string
  username: string
  role: Role
  avatar: string | null
  bio: string | null
  isActive: boolean
  createdAt: string
}

export interface AuthResponse {
  accessToken: string
  user: Pick<User, 'id' | 'email' | 'username' | 'role'>
}

export interface RegisterResponse {
  user: Pick<User, 'id' | 'email' | 'username' | 'role'>
}
