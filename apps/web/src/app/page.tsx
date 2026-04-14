import Link from 'next/link'
import { BookOpen, Instagram, LayoutDashboard, MessageCircle, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { Header } from '@/components/layout/header'
import { Footer } from '@/components/layout/footer'

const SECTIONS = [
  {
    href: '/catalog',
    label: 'Каталог',
    desc: 'Товары, категории, фильтры по цене и наличию',
    icon: ShoppingBag,
    color: 'bg-orange-500/10 text-orange-600',
  },
  {
    href: '/blog',
    label: 'Блог',
    desc: 'Статьи, новости и полезные материалы',
    icon: BookOpen,
    color: 'bg-purple-500/10 text-purple-600',
  },
  {
    href: '/forum',
    label: 'Форум',
    desc: 'Обсуждения, вопросы и ответы сообщества',
    icon: MessageCircle,
    color: 'bg-cyan-500/10 text-cyan-600',
  },
  {
    href: '/gram',
    label: 'Грам',
    desc: 'Короткие посты, лайки и комментарии',
    icon: Instagram,
    color: 'bg-pink-500/10 text-pink-600',
  },
]

export default function HomePage() {
  return (
    <>
      <Header />

      <main>
        {/* Hero */}
        <section className="border-b border-border bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
          <Container>
            <div className="mx-auto max-w-2xl text-center">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
                <LayoutDashboard className="h-3.5 w-3.5" />
                CMS Platform — конструктор сайтов
              </div>

              <h1 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
                Создавайте сайты <span className="text-primary">быстро и удобно</span>
              </h1>

              <p className="mt-6 text-lg text-muted-foreground">
                Многостраничный конструктор лендингов с каталогом, блогом, форумом и социальной
                лентой в одном месте.
              </p>

              <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button asChild size="lg">
                  <Link href="/register">Начать бесплатно</Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/catalog">Смотреть каталог</Link>
                </Button>
              </div>
            </div>
          </Container>
        </section>

        {/* Разделы платформы */}
        <section className="py-16 md:py-24">
          <Container>
            <div className="mb-10 text-center">
              <h2 className="text-2xl font-bold md:text-3xl">Всё что нужно — в одном месте</h2>
              <p className="mt-2 text-muted-foreground">
                Полноценная экосистема для вашего бизнеса
              </p>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {SECTIONS.map(({ href, label, desc, icon: Icon, color }) => (
                <Link
                  key={href}
                  href={href}
                  className="group rounded-2xl border border-border bg-card p-6 transition-colors hover:border-primary/40 hover:bg-accent/50"
                >
                  <div
                    className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${color}`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold group-hover:text-primary">{label}</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">{desc}</p>
                </Link>
              ))}
            </div>
          </Container>
        </section>

        {/* CTA */}
        <section className="border-t border-border bg-muted/30 py-16">
          <Container>
            <div className="mx-auto max-w-xl text-center">
              <h2 className="text-2xl font-bold md:text-3xl">Готовы начать?</h2>
              <p className="mt-3 text-muted-foreground">
                Зарегистрируйтесь и получите доступ ко всем возможностям платформы уже сегодня.
              </p>
              <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                <Button asChild size="lg">
                  <Link href="/register">Создать аккаунт</Link>
                </Button>
                <Button asChild variant="ghost" size="lg">
                  <Link href="/login">Войти в систему</Link>
                </Button>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </>
  )
}
