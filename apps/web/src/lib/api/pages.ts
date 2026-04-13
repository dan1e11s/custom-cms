import { api } from './client'
import type { Page, PageSeo, PagesListResponse } from '@/types/pages'
import type { BlockConfig } from '@/types/blocks'

export interface CreatePageDto {
  title: string
  slug?: string
  template?: string
}

export interface UpdatePageDto {
  title?: string
  slug?: string
  template?: string
  blocks?: BlockConfig[]
  status?: string
}

export type UpdatePageSeoDto = Partial<Omit<PageSeo, 'id' | 'pageId'>>

export interface PagesListParams {
  page?: number
  limit?: number
  search?: string
  status?: string
}

export const pagesApi = {
  list: (params: PagesListParams = {}) => {
    const q = new URLSearchParams()
    if (params.page) q.set('page', String(params.page))
    if (params.limit) q.set('limit', String(params.limit))
    if (params.search) q.set('search', params.search)
    if (params.status) q.set('status', params.status)
    const qs = q.toString()
    return api.get<PagesListResponse>(`/admin/pages${qs ? `?${qs}` : ''}`)
  },

  getById: (id: number) => api.get<Page>(`/admin/pages/${id}`),

  create: (dto: CreatePageDto) => api.post<Page>('/admin/pages', dto),

  update: (id: number, dto: UpdatePageDto) =>
    api.patch<Page>(`/admin/pages/${id}`, dto, { suppressLogout: true }),

  updateSeo: (id: number, dto: UpdatePageSeoDto) =>
    api.patch<Page>(`/admin/pages/${id}/seo`, dto, { suppressLogout: true }),

  updateBlocks: (id: number, blocks: BlockConfig[]) =>
    api.patch<Page>(`/admin/pages/${id}/blocks`, { blocks }, { suppressLogout: true }),

  publish: (id: number) => api.patch<Page>(`/admin/pages/${id}/publish`, {}),

  duplicate: (id: number) => api.post<Page>(`/admin/pages/${id}/duplicate`, {}),

  delete: (id: number) => api.delete<void>(`/admin/pages/${id}`),
}
