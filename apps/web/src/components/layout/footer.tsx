import Link from 'next/link'
import Image from 'next/image'
import { Container } from '@/components/ui/container'
import { fetchFooterColumns, fetchSiteSettings } from '@/lib/api/site'

/**
 * Server Component — загружает колонки футера и настройки с ISR-кэшем.
 * Теги: site-footer, site-settings
 */
export async function Footer() {
  const [columns, settings] = await Promise.all([fetchFooterColumns(), fetchSiteSettings()])

  const logoText = settings?.logoText || settings?.siteName || 'CMS Platform'
  const copyright =
    settings?.footerCopyright || `© ${new Date().getFullYear()} ${logoText}. Все права защищены.`

  return (
    <footer className="border-t border-border bg-muted/40">
      <Container>
        <div
          className={`grid grid-cols-1 gap-8 py-12 ${
            columns.length > 0 ? 'md:grid-cols-3' : 'md:grid-cols-1'
          }`}
        >
          {/* Первая колонка: логотип + описание */}
          <div>
            <Link href="/" className="flex items-center">
              {settings?.logoUrl ? (
                <Image
                  src={settings.logoUrl}
                  alt={logoText}
                  width={140}
                  height={40}
                  className="h-9 w-auto object-contain"
                />
              ) : (
                <span className="text-xl font-bold text-primary">{logoText}</span>
              )}
            </Link>
            <p className="mt-3 text-sm text-muted-foreground">
              Многостраничный сайт-конструктор лендингов для продвижения услуг и товаров.
            </p>
          </div>

          {/* Динамические колонки из CMS */}
          {columns.map((column) => (
            <div key={column.id}>
              <h3 className="mb-3 text-sm font-semibold">{column.title}</h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link.id}>
                    <Link
                      href={link.href}
                      target={link.openInNewTab ? '_blank' : undefined}
                      rel={link.openInNewTab ? 'noopener noreferrer' : undefined}
                      className="text-sm text-muted-foreground transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-border py-6 text-center text-sm text-muted-foreground">
          {copyright}
        </div>
      </Container>
    </footer>
  )
}
