import { fetchNavigation, fetchSiteSettings } from '@/lib/api/site'
import { HeaderClient } from './header-client'

/**
 * Server Component — загружает навигацию и настройки с ISR-кэшем,
 * передаёт данные в клиентский HeaderClient.
 */
export async function Header() {
  const [navItems, settings] = await Promise.all([fetchNavigation(), fetchSiteSettings()])

  return <HeaderClient navItems={navItems} settings={settings} />
}
