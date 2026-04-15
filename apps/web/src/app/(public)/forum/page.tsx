import type { Metadata } from 'next'
import { Container } from '@/components/ui/container'
import { FadeIn } from '@/components/ui/fade-in'
import { ForumSectionCard } from '@/components/forum/ForumSectionCard'
import { forumServerApi } from '@/lib/api/forum'
import { SITE_NAME } from '@/lib/seo/config'
import type { ForumSection } from '@/types/forum'

export const metadata: Metadata = {
  title: `Форум | ${SITE_NAME}`,
  description: 'Обсуждения, вопросы и ответы сообщества',
}

// Разделы форума меняются редко — SSG с ревалидацией раз в 10 минут
export const revalidate = 600

export default async function ForumPage() {
  let sections: ForumSection[] = []

  try {
    sections = await forumServerApi.getSections()
  } catch {
    // API недоступен — показываем пустой список
  }

  return (
    <Container className="py-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Форум</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Задавайте вопросы, обсуждайте темы, делитесь опытом
          </p>
        </div>

        {sections.length === 0 ? (
          <div className="py-20 text-center text-muted-foreground">
            <p className="font-medium">Разделов пока нет</p>
          </div>
        ) : (
          <div className="space-y-3">
            {sections.map((section, i) => (
              <FadeIn key={section.id} delay={i * 0.06}>
                <ForumSectionCard section={section} />
              </FadeIn>
            ))}
          </div>
        )}
      </div>
    </Container>
  )
}
