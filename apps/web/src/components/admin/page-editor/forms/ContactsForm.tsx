'use client'

import { Trash2, Plus } from 'lucide-react'
import type { ContactsBlockData, SocialLink } from '@/types/blocks'
import { useEditorStore } from '@/store/editor.store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

interface Props {
  blockId: string
  data: ContactsBlockData
}

export function ContactsForm({ blockId, data }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock)

  function upd(changes: Partial<ContactsBlockData>) {
    updateBlock(blockId, { data: { ...data, ...changes } })
  }

  function updSocial(index: number, changes: Partial<SocialLink>) {
    const socials = (data.socials ?? []).map((s, i) => (i === index ? { ...s, ...changes } : s))
    upd({ socials })
  }

  function addSocial() {
    upd({ socials: [...(data.socials ?? []), { name: '', url: '' }] })
  }

  function removeSocial(index: number) {
    upd({ socials: (data.socials ?? []).filter((_, i) => i !== index) })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Заголовок секции</Label>
        <Input
          value={data.heading ?? ''}
          onChange={(e) => upd({ heading: e.target.value })}
          placeholder="Контакты"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Адрес</Label>
        <Input
          value={data.address ?? ''}
          onChange={(e) => upd({ address: e.target.value })}
          placeholder="г. Москва, ул. Примерная, 1"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label>Телефон</Label>
          <Input
            value={data.phone ?? ''}
            onChange={(e) => upd({ phone: e.target.value })}
            placeholder="+7 (999) 000-00-00"
          />
        </div>
        <div className="space-y-1.5">
          <Label>Email</Label>
          <Input
            value={data.email ?? ''}
            onChange={(e) => upd({ email: e.target.value })}
            placeholder="info@example.com"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Часы работы</Label>
        <Input
          value={data.workingHours ?? ''}
          onChange={(e) => upd({ workingHours: e.target.value })}
          placeholder="Пн–Пт: 09:00 – 18:00"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Embed карты (iframe)</Label>
        <Textarea
          value={data.mapEmbed ?? ''}
          onChange={(e) => upd({ mapEmbed: e.target.value })}
          placeholder='<iframe src="https://..." ...></iframe>'
          rows={3}
        />
      </div>

      <div className="space-y-2 border-t pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Соцсети
          </p>
          <Button type="button" variant="outline" size="sm" onClick={addSocial}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Добавить
          </Button>
        </div>

        {(data.socials ?? []).map((social, index) => (
          <div key={index} className="flex items-center gap-2">
            <Input
              value={social.name}
              onChange={(e) => updSocial(index, { name: e.target.value })}
              placeholder="VK"
              className="w-24"
            />
            <Input
              value={social.url}
              onChange={(e) => updSocial(index, { url: e.target.value })}
              placeholder="https://vk.com/..."
              className="flex-1"
            />
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:text-destructive"
              onClick={() => removeSocial(index)}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  )
}
