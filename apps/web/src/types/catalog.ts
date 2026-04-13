export type PageStatus = 'DRAFT' | 'PUBLISHED' | 'ARCHIVED'

export interface Category {
  id: number
  slug: string
  name: string
  type: string
  parentId: number | null
  description: string | null
  image: string | null
  seoTitle: string | null
  seoDesc: string | null
  children?: Category[]
}

export interface ProductCategory {
  id: number
  slug: string
  name: string
}

export interface Product {
  id: number
  slug: string
  name: string
  description: string | null
  /** Decimal сериализуется Prisma как строка */
  price: string | null
  oldPrice: string | null
  images: string[]
  inStock: boolean
  status: PageStatus
  seoTitle: string | null
  seoDesc: string | null
  attributes: Record<string, string> | null
  createdAt: string
  categoryId: number | null
  category: ProductCategory | null
}

export interface ProductsListResponse {
  items: Product[]
  total: number
  page: number
  limit: number
  pages: number
}

export interface CatalogFiltersState {
  search?: string
  categorySlug?: string
  minPrice?: string
  maxPrice?: string
  inStock?: string
  page?: string
  sortBy?: string
  sortOrder?: string
}
