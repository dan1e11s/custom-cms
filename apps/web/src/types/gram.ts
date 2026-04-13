export interface GramAuthor {
  id: number
  username: string
  avatar: string | null
}

export interface GramTag {
  id: number
  slug: string
  name: string
}

export interface GramPost {
  id: number
  content: string
  images: string[]
  status: string
  createdAt: string
  authorId: number
  author: GramAuthor
  tags: GramTag[]
  _count: {
    likes: number
    comments: number
  }
}

export interface GramFeedResponse {
  posts: GramPost[]
  nextCursor?: number
}

export interface GramComment {
  id: number
  content: string
  createdAt: string
  isDeleted: boolean
  author: GramAuthor
  parentId: number | null
  replies: GramComment[]
}

export interface LikeStatus {
  liked: boolean
  count: number
}
