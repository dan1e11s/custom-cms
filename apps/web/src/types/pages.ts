import type { BlockConfig } from './blocks'

export type PageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface PageSeo {
  id: number
  pageId: number
  metaTitle: string | null
  metaDesc: string | null
  h1: string | null
  canonical: string | null
  ogTitle: string | null
  ogDesc: string | null
  ogImage: string | null
  noindex: boolean
  schemaType: string | null
  schemaData: unknown
}

export interface PageAuthor {
  id: number
  username: string
  avatar: string | null
}

export interface Page {
  id: number
  slug: string
  title: string
  status: PageStatus
  template: string
  blocks: BlockConfig[]
  isHomePage: boolean
  authorId: number
  author: PageAuthor
  seo: PageSeo | null
  createdAt: string
  updatedAt: string
}

export interface PagesListResponse {
  items: Page[]
  total: number
  page: number
  limit: number
  pages: number
}
