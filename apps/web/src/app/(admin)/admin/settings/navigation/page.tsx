'use client'

import { useState, useEffect } from 'react'
import { Spinner } from '@/components/ui/spinner'
import { NavEditor } from '@/components/admin/nav-editor/NavEditor'
import { siteAdminApi, type NavItem } from '@/lib/api/site'

export default function NavigationSettingsPage() {
  const [items, setItems] = useState<NavItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    siteAdminApi
      .getNavigation()
      .then(setItems)
      .catch(() => setItems([]))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Навигация шапки</h1>
        <p className="text-sm text-muted-foreground">
          Управляйте пунктами меню сайта. Изменения применяются сразу после сохранения.
        </p>
      </div>

      <NavEditor initialItems={items} />
    </div>
  )
}
