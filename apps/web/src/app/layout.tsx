import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from '@/components/shared/providers'
import './globals.css'

const inter = Inter({ subsets: ['latin', 'cyrillic'] })

export const metadata: Metadata = {
  title: {
    default: 'CMS Platform',
    template: '%s | CMS Platform',
  },
  description: 'Многостраничный сайт-конструктор лендингов',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
