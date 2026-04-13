import { api } from './client'

export interface SeoSettings {
  id: number
  siteName: string
  defaultOgImage: string | null
  titleTemplate: string
  sitemapBuiltAt: string | null
  updatedAt: string
}

export interface Redirect {
  id: number
  from: string
  to: string
  statusCode: number
  isActive: boolean
  createdAt: string
}

export interface SitemapEntry {
  url: string
  lastModified: string
  changeFrequency: string
  priority: number
}

// ── Публичные ─────────────────────────────────────────────────────────────────

export const seoApi = {
  getSettings: () => api.get<SeoSettings>('/seo/settings'),

  getSitemapData: () => api.get<SitemapEntry[]>('/seo/sitemap-data'),

  // ── Admin ──────────────────────────────────────────────────────────────────

  updateSettings: (
    data: Partial<Pick<SeoSettings, 'siteName' | 'defaultOgImage' | 'titleTemplate'>>,
  ) => api.patch<SeoSettings>('/admin/seo/settings', data),

  getRedirects: () => api.get<Redirect[]>('/admin/seo/redirects'),

  createRedirect: (data: { from: string; to: string; statusCode?: number }) =>
    api.post<Redirect>('/admin/seo/redirects', data),

  updateRedirect: (id: number, data: { isActive?: boolean; to?: string; statusCode?: number }) =>
    api.patch<Redirect>(`/admin/seo/redirects/${id}`, data),

  deleteRedirect: (id: number) => api.delete<{ success: boolean }>(`/admin/seo/redirects/${id}`),

  rebuildSitemap: () =>
    api.post<{ success: boolean; message: string }>('/admin/seo/sitemap/rebuild', {}),
}
