'use client'

import { useState } from 'react'
import { ImagePlus, Loader2, Send, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { gramApi } from '@/lib/api/gram'
import type { GramPost } from '@/types/gram'

interface CreatePostModalProps {
  open: boolean
  onClose: () => void
  onCreated: (post: GramPost) => void
}

export function CreatePostModal({ open, onClose, onCreated }: CreatePostModalProps) {
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [imageInput, setImageInput] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const maxLength = 2000
  const remaining = maxLength - content.length

  const addImage = () => {
    const url = imageInput.trim()
    if (!url || images.length >= 10) return
    setImages((p) => [...p, url])
    setImageInput('')
  }

  const removeImage = (i: number) => setImages((p) => p.filter((_, j) => j !== i))

  const handleSubmit = async () => {
    if (!content.trim()) return
    setSubmitting(true)
    setError('')
    try {
      const post = await gramApi.createPost({
        content: content.trim(),
        images: images.filter(Boolean),
      })
      onCreated(post)
      setContent('')
      setImages([])
      setImageInput('')
      onClose()
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Не удалось опубликовать')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Новый пост</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Контент */}
          <div className="space-y-1.5">
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Что нового? Используйте #хэштеги"
              rows={5}
              maxLength={maxLength}
              className="resize-none"
            />
            <p
              className={`text-right text-xs ${remaining < 100 ? 'text-orange-500' : 'text-muted-foreground'}`}
            >
              {remaining} символов
            </p>
          </div>

          {/* Изображения */}
          <div className="space-y-2">
            <div className="flex gap-2">
              <Input
                value={imageInput}
                onChange={(e) => setImageInput(e.target.value)}
                placeholder="URL изображения..."
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addImage())}
                disabled={images.length >= 10}
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={addImage}
                disabled={!imageInput.trim() || images.length >= 10}
                title="Добавить изображение"
              >
                <ImagePlus className="h-4 w-4" />
              </Button>
            </div>

            {images.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {images.map((url, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1 rounded-md border bg-muted px-2 py-1 text-xs"
                  >
                    <span className="max-w-[140px] truncate text-muted-foreground">{url}</span>
                    <button
                      onClick={() => removeImage(i)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {images.length > 0 && (
              <p className="text-xs text-muted-foreground">{images.length}/10 изображений</p>
            )}
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Отмена
            </Button>
            <Button onClick={handleSubmit} disabled={submitting || !content.trim()}>
              {submitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Опубликовать
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
