'use client'

import { useEffect, useRef, useState } from 'react'
import { Camera, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { usersApi } from '@/lib/api/users'
import { useAuthStore } from '@/store/auth.store'
import type { User } from '@/types/auth'

export default function ProfilePage() {
  const setUser = useAuthStore((s) => s.setUser)
  const storeUser = useAuthStore((s) => s.user)

  const [profile, setProfile] = useState<User | null>(null)
  const [username, setUsername] = useState('')
  const [bio, setBio] = useState('')

  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    usersApi
      .getMe()
      .then((u) => {
        setProfile(u)
        setUsername(u.username)
        setBio(u.bio ?? '')
      })
      .catch(() => {})
  }, [])

  const handleSave = async () => {
    setError(null)
    setSuccess(false)
    setSaving(true)
    try {
      const updated = await usersApi.updateMe({ username, bio })
      setProfile(updated)
      setUser({ ...storeUser!, username: updated.username })
      setSuccess(true)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Ошибка при сохранении')
    } finally {
      setSaving(false)
    }
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploading(true)
    setError(null)
    try {
      const updated = await usersApi.uploadAvatar(file)
      setProfile(updated)
    } catch {
      setError('Ошибка при загрузке аватара')
    } finally {
      setUploading(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  return (
    <div className="mx-auto max-w-lg space-y-8">
      <h1 className="text-2xl font-bold">Редактирование профиля</h1>

      {/* Аватар */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-primary/10 text-3xl font-bold uppercase text-primary">
            {profile?.avatar ? (
              <img src={profile.avatar} alt={profile.username} className="h-24 w-24 object-cover" />
            ) : (
              (profile?.username?.[0] ?? '?')
            )}
          </div>
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="absolute bottom-0 right-0 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-md transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Camera className="h-4 w-4" />
            )}
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>
        <p className="text-xs text-muted-foreground">Нажмите на иконку камеры для загрузки</p>
      </div>

      {/* Форма */}
      <div className="space-y-4 rounded-xl border border-border bg-card p-6">
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={profile?.email ?? ''} disabled className="bg-muted" />
          <p className="text-xs text-muted-foreground">Email нельзя изменить</p>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="username">Имя пользователя</Label>
          <Input
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="username"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="bio">О себе</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Расскажите немного о себе..."
            rows={4}
            maxLength={500}
          />
          <p className="text-right text-xs text-muted-foreground">{bio.length}/500</p>
        </div>

        {error && (
          <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">{error}</p>
        )}
        {success && (
          <p className="rounded-md bg-green-500/10 px-3 py-2 text-sm text-green-600 dark:text-green-400">
            Профиль успешно обновлён
          </p>
        )}

        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Сохранить
        </Button>
      </div>
    </div>
  )
}
