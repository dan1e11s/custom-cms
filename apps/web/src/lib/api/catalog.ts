import { serverApi } from './server'
import { api } from './client'
import type { Category, Product, ProductsListResponse } from '@/types/catalog'

export interface CatalogQueryParams {
  categoryId?: number
  search?: string
  minPrice?: number
  maxPrice?: number
  inStock?: boolean
  page?: number
  limit?: number
  sortBy?: string
  sortOrder?: string
}

function buildQueryString(params: CatalogQueryParams): string {
  const entries = (
    Object.entries(params) as [string, string | number | boolean | undefined][]
  ).filter(([, v]) => v !== undefined && v !== '')
  if (!entries.length) return ''
  return '?' + entries.map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&')
}

// ── Серверный (Server Components, SSG, ISR, SSR) ───────────────────────────────

export const catalogServerApi = {
  getCategoryTree: (opts?: Parameters<typeof serverApi.get>[1]) =>
    serverApi.get<Category[]>('/catalog/categories/tree', opts),

  getCategoryBySlug: (slug: string, opts?: Parameters<typeof serverApi.get>[1]) =>
    serverApi.get<Category>(`/catalog/categories/${slug}`, opts),

  getProducts: (params: CatalogQueryParams = {}, opts?: Parameters<typeof serverApi.get>[1]) =>
    serverApi.get<ProductsListResponse>(`/catalog/products${buildQueryString(params)}`, opts),

  getProductBySlug: (slug: string, opts?: Parameters<typeof serverApi.get>[1]) =>
    serverApi.get<Product>(`/catalog/products/${slug}`, opts),

  getRelated: (slug: string, opts?: Parameters<typeof serverApi.get>[1]) =>
    serverApi.get<Product[]>(`/catalog/products/${slug}/related`, opts),
}

// ── Клиентский (Client Components, Admin) ────────────────────────────────────

export const catalogApi = {
  // Public
  getCategoryTree: () => api.get<Category[]>('/catalog/categories/tree'),
  getProducts: (params: CatalogQueryParams = {}) =>
    api.get<ProductsListResponse>(`/catalog/products${buildQueryString(params)}`),

  // Admin
  getAllProducts: (params: CatalogQueryParams = {}) =>
    api.get<ProductsListResponse>(`/admin/catalog/products${buildQueryString(params)}`),
  getProductById: (id: number) => api.get<Product>(`/admin/catalog/products/${id}`),
  createProduct: (data: Partial<Product>) => api.post<Product>('/admin/catalog/products', data),
  updateProduct: (id: number, data: Partial<Product>) =>
    api.patch<Product>(`/admin/catalog/products/${id}`, data),
  publishProduct: (id: number) => api.patch<Product>(`/admin/catalog/products/${id}/publish`, {}),
  unpublishProduct: (id: number) =>
    api.patch<Product>(`/admin/catalog/products/${id}/unpublish`, {}),
  deleteProduct: (id: number) => api.delete<{ success: boolean }>(`/admin/catalog/products/${id}`),

  createCategory: (data: Partial<Category>) =>
    api.post<Category>('/admin/catalog/categories', data),
  updateCategory: (id: number, data: Partial<Category>) =>
    api.patch<Category>(`/admin/catalog/categories/${id}`, data),
  deleteCategory: (id: number) =>
    api.delete<{ success: boolean }>(`/admin/catalog/categories/${id}`),
}
