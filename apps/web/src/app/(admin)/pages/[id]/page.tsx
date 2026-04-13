'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { pagesApi } from '@/lib/api/pages'
import type { Page } from '@/types/pages'
import { PageEditor } from '@/components/admin/page-editor/PageEditor'
import { Spinner } from '@/components/ui/spinner'
import { Button } from '@/components/ui/button'
import { AlertCircle } from 'lucide-react'

interface Props {
  params: { id: string }
}

export default function AdminPageEditorRoute({ params }: Props) {
  const router = useRouter()
  const id = Number(params.id)

  const [page, setPage] = useState<Page | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id || isNaN(id)) {
      setError('Некорректный ID страницы')
      return
    }
    pagesApi
      .getById(id)
      .then(setPage)
      .catch((err) => setError(err.message ?? 'Ошибка загрузки'))
  }, [id])

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
        <AlertCircle className="h-10 w-10 text-destructive opacity-70" />
        <p className="text-sm">{error}</p>
        <Button variant="outline" onClick={() => router.push('/admin/pages')}>
          К списку страниц
        </Button>
      </div>
    )
  }

  if (!page) {
    return (
      <div className="flex items-center justify-center h-full">
        <Spinner size="lg" />
      </div>
    )
  }

  return <PageEditor initialPage={page} />
}
