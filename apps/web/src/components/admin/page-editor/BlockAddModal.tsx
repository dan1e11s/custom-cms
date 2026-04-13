'use client'

import { useState } from 'react'
import type { BlockType } from '@/types/blocks'
import { BLOCK_META } from '@/components/blocks/meta'
import { useEditorStore } from '@/store/editor.store'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'

interface BlockAddModalProps {
  open: boolean
  onClose: () => void
  afterId?: string
}

export function BlockAddModal({ open, onClose, afterId }: BlockAddModalProps) {
  const addBlock = useEditorStore((s) => s.addBlock)
  const [search, setSearch] = useState('')

  const allTypes = Object.values(BLOCK_META)
  const filtered = allTypes.filter(
    (m) =>
      search === '' ||
      m.label.toLowerCase().includes(search.toLowerCase()) ||
      m.description.toLowerCase().includes(search.toLowerCase()),
  )

  function handleSelect(type: BlockType) {
    addBlock(type, afterId)
    onClose()
    setSearch('')
  }

  function handleOpenChange(open: boolean) {
    if (!open) {
      onClose()
      setSearch('')
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Добавить блок</DialogTitle>
        </DialogHeader>

        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск блока..."
          autoFocus
        />

        <div className="grid grid-cols-2 gap-2 max-h-[360px] overflow-y-auto mt-1 pr-1">
          {filtered.map((meta) => (
            <button
              key={meta.type}
              type="button"
              onClick={() => handleSelect(meta.type)}
              className="flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-colors hover:border-primary hover:bg-primary/5"
            >
              <span className="text-xl leading-none">{meta.icon}</span>
              <span className="text-sm font-medium">{meta.label}</span>
              <span className="text-xs text-muted-foreground leading-tight">
                {meta.description}
              </span>
            </button>
          ))}

          {filtered.length === 0 && (
            <p className="col-span-2 py-8 text-center text-sm text-muted-foreground">
              Ничего не найдено
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
