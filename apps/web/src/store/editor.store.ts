import { create } from 'zustand'
import { arrayMove } from '@dnd-kit/sortable'
import type { BlockConfig, BlockType } from '@/types/blocks'
import type { Page, PageSeo, PageStatus } from '@/types/pages'
import { BLOCK_META } from '@/components/blocks/meta'
import { pagesApi } from '@/lib/api/pages'

function genId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7)
}

interface EditorState {
  pageId: number | null
  title: string
  slug: string
  status: PageStatus
  blocks: BlockConfig[]
  seo: Partial<PageSeo> | null
  selectedBlockId: string | null
  isDirty: boolean
  isSaving: boolean
  saveError: string | null
  activeTab: 'blocks' | 'seo'
}

interface EditorActions {
  init: (page: Page) => void
  setTitle: (title: string) => void
  setSlug: (slug: string) => void
  setBlocks: (blocks: BlockConfig[]) => void
  addBlock: (type: BlockType, afterId?: string) => void
  removeBlock: (id: string) => void
  updateBlock: (id: string, changes: Partial<BlockConfig>) => void
  toggleBlock: (id: string) => void
  reorderBlocks: (activeId: string, overId: string) => void
  selectBlock: (id: string | null) => void
  setActiveTab: (tab: 'blocks' | 'seo') => void
  updateSeo: (seo: Partial<PageSeo>) => void
  save: () => Promise<void>
  publish: () => Promise<void>
}

export type EditorStore = EditorState & EditorActions

export const useEditorStore = create<EditorStore>()((set, get) => ({
  pageId: null,
  title: '',
  slug: '',
  status: 'DRAFT',
  blocks: [],
  seo: null,
  selectedBlockId: null,
  isDirty: false,
  isSaving: false,
  saveError: null,
  activeTab: 'blocks',

  init: (page) =>
    set({
      pageId: page.id,
      title: page.title,
      slug: page.slug,
      status: page.status,
      blocks: page.blocks ?? [],
      seo: page.seo ?? null,
      selectedBlockId: null,
      isDirty: false,
      isSaving: false,
      saveError: null,
      activeTab: 'blocks',
    }),

  setTitle: (title) => set({ title, isDirty: true }),
  setSlug: (slug) => set({ slug, isDirty: true }),
  setBlocks: (blocks) => set({ blocks, isDirty: true }),

  addBlock: (type, afterId) => {
    const meta = BLOCK_META[type]
    const newBlock: BlockConfig = {
      id: genId(),
      type,
      order: 0,
      enabled: true,
      data: meta.defaultData,
    }
    set((state) => {
      let blocks = [...state.blocks]
      if (afterId) {
        const idx = blocks.findIndex((b) => b.id === afterId)
        blocks.splice(idx + 1, 0, newBlock)
      } else {
        blocks.push(newBlock)
      }
      blocks = blocks.map((b, i) => ({ ...b, order: i }))
      return { blocks, selectedBlockId: newBlock.id, isDirty: true }
    })
  },

  removeBlock: (id) =>
    set((state) => ({
      blocks: state.blocks.filter((b) => b.id !== id).map((b, i) => ({ ...b, order: i })),
      selectedBlockId: state.selectedBlockId === id ? null : state.selectedBlockId,
      isDirty: true,
    })),

  updateBlock: (id, changes) =>
    set((state) => ({
      blocks: state.blocks.map((b) => (b.id === id ? { ...b, ...changes } : b)),
      isDirty: true,
    })),

  toggleBlock: (id) =>
    set((state) => ({
      blocks: state.blocks.map((b) => (b.id === id ? { ...b, enabled: !b.enabled } : b)),
      isDirty: true,
    })),

  reorderBlocks: (activeId, overId) =>
    set((state) => {
      const aIdx = state.blocks.findIndex((b) => b.id === activeId)
      const oIdx = state.blocks.findIndex((b) => b.id === overId)
      if (aIdx === -1 || oIdx === -1) return {}
      const reordered = arrayMove(state.blocks, aIdx, oIdx).map((b, i) => ({ ...b, order: i }))
      return { blocks: reordered, isDirty: true }
    }),

  selectBlock: (id) => set({ selectedBlockId: id }),

  setActiveTab: (tab) => set({ activeTab: tab }),

  updateSeo: (seo) =>
    set((state) => ({
      seo: { ...state.seo, ...seo } as Partial<PageSeo>,
      isDirty: true,
    })),

  save: async () => {
    const { pageId, title, slug, blocks, seo } = get()
    if (!pageId) return
    set({ isSaving: true, saveError: null })
    try {
      // Обновляем основные поля страницы и SEO двумя параллельными запросами,
      // т.к. бэкенд использует разные эндпоинты: PATCH /:id и PATCH /:id/seo
      const calls: Promise<unknown>[] = [pagesApi.update(pageId, { title, slug, blocks })]
      if (seo) {
        calls.push(
          pagesApi.updateSeo(pageId, {
            metaTitle: seo.metaTitle ?? undefined,
            metaDesc: seo.metaDesc ?? undefined,
            h1: seo.h1 ?? undefined,
            canonical: seo.canonical ?? undefined,
            ogTitle: seo.ogTitle ?? undefined,
            ogDesc: seo.ogDesc ?? undefined,
            ogImage: seo.ogImage ?? undefined,
            noindex: seo.noindex,
            schemaType: seo.schemaType ?? undefined,
          }),
        )
      }
      await Promise.all(calls)
      set({ isDirty: false, saveError: null })
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Ошибка сохранения'
      set({ saveError: msg })
      // Пробрасываем ошибку дальше, чтобы автосохранение могло её поймать
      throw err
    } finally {
      set({ isSaving: false })
    }
  },

  publish: async () => {
    const { pageId, save } = get()
    if (!pageId) return
    await save()
    await pagesApi.publish(pageId)
    set({ status: 'PUBLISHED' })
  },
}))
