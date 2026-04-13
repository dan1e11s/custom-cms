export type PageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface BlogTag {
  id: number
  slug: string
  name: string
}

export interface BlogCategory {
  id: number
  slug: string
  name: string
}

export interface BlogAuthor {
  id: number
  username: string
  avatar: string | null
}

export interface BlogPost {
  id: number
  slug: string
  title: string
  excerpt: string | null
  content: string
  coverImage: string | null
  status: PageStatus
  publishedAt: string | null
  createdAt: string
  views: number
  seoTitle: string | null
  seoDesc: string | null
  authorId: number
  author: BlogAuthor
  categoryId: number | null
  category: BlogCategory | null
  tags: BlogTag[]
  _count?: { comments: number }
}

export interface BlogListResponse {
  items: BlogPost[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface BlogComment {
  id: number
  content: string
  createdAt: string
  isDeleted: boolean
  author: BlogAuthor
  parentId: number | null
  replies: BlogComment[]
}
