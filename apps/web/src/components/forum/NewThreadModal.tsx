'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { forumApi } from '@/lib/api/forum'

interface NewThreadModalProps {
  open: boolean
  onClose: () => void
  sectionId: number
  sectionSlug: string
}

export function NewThreadModal({ open, onClose, sectionId, sectionSlug }: NewThreadModalProps) {
  const router = useRouter()
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !content.trim() || submitting) return
    setError(null)
    setSubmitting(true)

    try {
      const thread = await forumApi.createThread({
        title: title.trim(),
        content: content.trim(),
        sectionId,
      })
      onClose()
      setTitle('')
      setContent('')
      router.push(`/forum/${sectionSlug}/${thread.slug}`)
      router.refresh()
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Не удалось создать тему')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Новая тема</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <Label htmlFor="thread-title">Заголовок</Label>
            <Input
              id="thread-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Тема обсуждения…"
              maxLength={200}
              required
            />
            <p className="text-right text-xs text-muted-foreground">{title.length} / 200</p>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="thread-content">Первое сообщение</Label>
            <Textarea
              id="thread-content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Опишите тему подробнее…"
              className="min-h-[150px] resize-none"
              maxLength={50000}
              required
            />
            <p className="text-right text-xs text-muted-foreground">{content.length} / 50 000</p>
          </div>

          {error && (
            <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={onClose} disabled={submitting}>
              Отмена
            </Button>
            <Button type="submit" disabled={submitting || !title.trim() || !content.trim()}>
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Создать тему
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
