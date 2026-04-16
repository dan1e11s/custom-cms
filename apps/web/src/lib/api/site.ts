/**
 * API-функции для данных сайта: навигация, футер, настройки, главная страница.
 * Серверные функции используют ISR-теги для кэширования.
 */

import { serverApi } from './server'
import { api } from './client'

// ─── Типы ────────────────────────────────────────────────────────────────────

export type NavItemType = 'PAGE' | 'CATALOG' | 'BLOG' | 'FORUM' | 'GRAM' | 'EXTERNAL' | 'DROPDOWN'

export interface NavItem {
  id: number
  label: string
  type: NavItemType
  href: string | null
  icon: string | null
  description: string | null
  order: number
  parentId: number | null
  isVisible: boolean
  openInNewTab: boolean
  children: NavItem[]
}

export interface FooterLink {
  id: number
  label: string
  href: string
  columnId: number
  order: number
  openInNewTab: boolean
}

export interface FooterColumn {
  id: number
  title: string
  order: number
  links: FooterLink[]
}

export interface SiteSettings {
  id: number
  siteName: string
  defaultOgImage: string | null
  titleTemplate: string
  logoUrl: string | null
  logoText: string | null
  footerCopyright: string | null
  updatedAt: string
}

// ─── Серверные функции (для Server Components с ISR-кэшем) ───────────────────

/** Получить дерево навигации (только видимые пункты). ISR-тег: site-navigation */
export async function fetchNavigation(): Promise<NavItem[]> {
  try {
    return await serverApi.get<NavItem[]>('/site/navigation', {
      tags: ['site-navigation'],
      revalidate: 3600,
    })
  } catch {
    return []
  }
}

/** Получить колонки футера с ссылками. ISR-тег: site-footer */
export async function fetchFooterColumns(): Promise<FooterColumn[]> {
  try {
    return await serverApi.get<FooterColumn[]>('/site/footer', {
      tags: ['site-footer'],
      revalidate: 3600,
    })
  } catch {
    return []
  }
}

/** Получить настройки сайта (логотип, название, копирайт). ISR-тег: site-settings */
export async function fetchSiteSettings(): Promise<SiteSettings | null> {
  try {
    return await serverApi.get<SiteSettings>('/site/settings', {
      tags: ['site-settings'],
      revalidate: 3600,
    })
  } catch {
    return null
  }
}

/** Получить главную страницу (isHomePage=true, PUBLISHED). ISR-тег: home-page */
export async function fetchHomePage() {
  try {
    return await serverApi.get<{
      id: number
      slug: string
      title: string
      blocks: unknown[]
      seo: Record<string, unknown> | null
    } | null>('/pages/home', {
      tags: ['home-page'],
      revalidate: 3600,
    })
  } catch {
    return null
  }
}

// ─── Клиентские функции (для Admin CRUD, без кэша) ────────────────────────────

export const siteAdminApi = {
  // Навигация
  getNavigation: () => api.get<NavItem[]>('/admin/site/navigation'),

  createNavItem: (dto: Partial<NavItem> & { label: string }) =>
    api.post<NavItem>('/admin/site/navigation', dto),

  updateNavItem: (id: number, dto: Partial<NavItem>) =>
    api.patch<NavItem>(`/admin/site/navigation/${id}`, dto),

  deleteNavItem: (id: number) => api.delete<{ deleted: boolean }>(`/admin/site/navigation/${id}`),

  reorderNavItems: (ids: number[]) =>
    api.patch<{ reordered: boolean }>('/admin/site/navigation/reorder', { ids }),

  // Футер — получение (admin, все колонки)
  getFooterColumns: () => api.get<FooterColumn[]>('/admin/site/footer/columns'),

  // Футер — колонки
  createFooterColumn: (dto: { title: string; order?: number }) =>
    api.post<FooterColumn>('/admin/site/footer/columns', dto),

  updateFooterColumn: (id: number, dto: { title?: string; order?: number }) =>
    api.patch<FooterColumn>(`/admin/site/footer/columns/${id}`, dto),

  deleteFooterColumn: (id: number) =>
    api.delete<{ deleted: boolean }>(`/admin/site/footer/columns/${id}`),

  // Футер — ссылки
  createFooterLink: (dto: {
    label: string
    href: string
    columnId: number
    openInNewTab?: boolean
    order?: number
  }) => api.post<FooterLink>('/admin/site/footer/links', dto),

  updateFooterLink: (id: number, dto: Partial<FooterLink>) =>
    api.patch<FooterLink>(`/admin/site/footer/links/${id}`, dto),

  deleteFooterLink: (id: number) =>
    api.delete<{ deleted: boolean }>(`/admin/site/footer/links/${id}`),

  // Настройки сайта
  getSettings: () => api.get<SiteSettings>('/admin/site/settings'),

  updateSettings: (dto: Partial<SiteSettings>) =>
    api.patch<SiteSettings>('/admin/site/settings', dto),

  // Главная страница
  setHomePage: (pageId: number) => api.patch<unknown>(`/admin/pages/${pageId}/set-home`, {}),
}
