'use client'

import { useEditorStore } from '@/store/editor.store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { MediaPicker } from './MediaPicker'

export function SeoTab() {
  const { slug, setSlug, seo, updateSeo } = useEditorStore()
  const s = seo ?? {}

  return (
    <div className="space-y-5">
      <div className="space-y-1.5">
        <Label>URL страницы (slug)</Label>
        <div className="flex items-center gap-1">
          <span className="text-muted-foreground text-sm shrink-0">/</span>
          <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="my-page" />
        </div>
      </div>

      <div className="space-y-1.5">
        <Label>Meta Title</Label>
        <Input
          value={s.metaTitle ?? ''}
          onChange={(e) => updateSeo({ metaTitle: e.target.value })}
          placeholder="Заголовок для поисковиков"
        />
        <p className="text-xs text-muted-foreground">{(s.metaTitle ?? '').length} / 60</p>
      </div>

      <div className="space-y-1.5">
        <Label>Meta Description</Label>
        <Textarea
          value={s.metaDesc ?? ''}
          onChange={(e) => updateSeo({ metaDesc: e.target.value })}
          placeholder="Описание для поисковиков"
          rows={3}
        />
        <p className="text-xs text-muted-foreground">{(s.metaDesc ?? '').length} / 160</p>
      </div>

      <div className="space-y-1.5">
        <Label>H1 на странице</Label>
        <Input
          value={s.h1 ?? ''}
          onChange={(e) => updateSeo({ h1: e.target.value })}
          placeholder="Если отличается от заголовка в Баннере"
        />
      </div>

      <div className="space-y-1.5">
        <Label>Canonical URL</Label>
        <Input
          value={s.canonical ?? ''}
          onChange={(e) => updateSeo({ canonical: e.target.value })}
          placeholder="https://example.com/my-page"
        />
      </div>

      <div className="space-y-4 border-t pt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Open Graph
        </p>

        <div className="space-y-1.5">
          <Label>OG Title</Label>
          <Input
            value={s.ogTitle ?? ''}
            onChange={(e) => updateSeo({ ogTitle: e.target.value })}
            placeholder="По умолчанию = Meta Title"
          />
        </div>

        <div className="space-y-1.5">
          <Label>OG Description</Label>
          <Textarea
            value={s.ogDesc ?? ''}
            onChange={(e) => updateSeo({ ogDesc: e.target.value })}
            placeholder="По умолчанию = Meta Description"
            rows={2}
          />
        </div>

        <div className="space-y-1.5">
          <Label>OG Image</Label>
          <MediaPicker value={s.ogImage ?? ''} onChange={(url) => updateSeo({ ogImage: url })} />
        </div>
      </div>

      <div className="space-y-4 border-t pt-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Дополнительно
        </p>

        <div className="space-y-1.5">
          <Label>Тип Schema.org</Label>
          <Select
            value={s.schemaType ?? 'none'}
            onValueChange={(v) => updateSeo({ schemaType: v === 'none' ? null : v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">Без разметки</SelectItem>
              <SelectItem value="WebPage">WebPage</SelectItem>
              <SelectItem value="FAQPage">FAQPage (авто из FAQ-блока)</SelectItem>
              <SelectItem value="Article">Article</SelectItem>
              <SelectItem value="LocalBusiness">LocalBusiness</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <Label>Закрыть от индексации</Label>
            <p className="text-xs text-muted-foreground">noindex, nofollow</p>
          </div>
          <Switch checked={s.noindex ?? false} onCheckedChange={(v) => updateSeo({ noindex: v })} />
        </div>
      </div>
    </div>
  )
}
