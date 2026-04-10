import Link from 'next/link'
import { Container } from '@/components/ui/container'

const FOOTER_LINKS = {
  Навигация: [
    { href: '/catalog', label: 'Каталог' },
    { href: '/blog', label: 'Блог' },
    { href: '/forum', label: 'Форум' },
    { href: '/gram', label: 'Грам' },
  ],
  Контакты: [
    { href: '/about', label: 'О нас' },
    { href: '/privacy', label: 'Политика конфиденциальности' },
    { href: '/terms', label: 'Условия использования' },
  ],
}

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted/40">
      <Container>
        <div className="grid grid-cols-1 gap-8 py-12 md:grid-cols-3">
          <div>
            <Link href="/" className="text-xl font-bold text-primary">
              CMS Platform
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Многостраничный сайт-конструктор лендингов для продвижения услуг и товаров.
            </p>
          </div>

          {Object.entries(FOOTER_LINKS).map(([title, links]) => (
            <div key={title}>
              <h3 className="mb-3 text-sm font-semibold">{title}</h3>
              <ul className="space-y-2">
                {links.map(({ href, label }) => (
                  <li key={href}>
                    <Link
                      href={href}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border py-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} CMS Platform. Все права защищены.
        </div>
      </Container>
    </footer>
  )
}
