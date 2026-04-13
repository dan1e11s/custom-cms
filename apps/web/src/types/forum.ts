export interface ForumAuthor {
  id: number
  username: string
  avatar: string | null
}

// ── Разделы ──────────────────────────────────────────────────────────────────

export interface ForumSection {
  id: number
  slug: string
  title: string
  description: string | null
  order: number
  _count: {
    threads: number
  }
}

// ── Темы ─────────────────────────────────────────────────────────────────────

export interface ForumThread {
  id: number
  slug: string
  title: string
  isPinned: boolean
  isLocked: boolean
  views: number
  createdAt: string
  lastPostAt: string
  authorId: number
  author: ForumAuthor
  section: {
    id: number
    slug: string
    title: string
  }
  _count: {
    posts: number
  }
}

export interface ForumThreadsResponse {
  items: ForumThread[]
  total: number
  page: number
  limit: number
  pages: number
}

// ── Сообщения ────────────────────────────────────────────────────────────────

export interface ForumPost {
  id: number
  content: string // HTML (rich-text)
  threadId: number
  authorId: number
  author: ForumAuthor
  isDeleted: boolean
  createdAt: string
  _count: {
    comments: number
  }
}

export interface ForumPostsResponse {
  items: ForumPost[]
  total: number
  page: number
  limit: number
  pages: number
}
