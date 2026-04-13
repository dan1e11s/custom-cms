'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { NewThreadModal } from './NewThreadModal'
import { useAuthStore } from '@/store/auth.store'

interface NewThreadButtonProps {
  sectionId: number
  sectionSlug: string
}

export function NewThreadButton({ sectionId, sectionSlug }: NewThreadButtonProps) {
  const user = useAuthStore((s) => s.user)
  const [open, setOpen] = useState(false)

  if (!user) return null

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm" className="flex-shrink-0">
        <Plus className="h-4 w-4" />
        Новая тема
      </Button>
      <NewThreadModal
        open={open}
        onClose={() => setOpen(false)}
        sectionId={sectionId}
        sectionSlug={sectionSlug}
      />
    </>
  )
}
