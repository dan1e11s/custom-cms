import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import Link from 'next/link'

export default function SlugNotFound() {
  return (
    <section className="flex min-h-[60vh] items-center">
      <Container>
        <div className="mx-auto max-w-md text-center">
          <p className="mb-2 text-6xl font-bold text-gray-200">404</p>
          <h1 className="mb-3 text-2xl font-bold text-gray-900">Страница не найдена</h1>
          <p className="mb-8 text-gray-500">
            Запрашиваемая страница не существует или была удалена.
          </p>
          <Button asChild>
            <Link href="/">На главную</Link>
          </Button>
        </div>
      </Container>
    </section>
  )
}
