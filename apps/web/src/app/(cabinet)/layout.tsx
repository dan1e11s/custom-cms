import { redirect } from 'next/navigation'
import { CabinetSidebar } from '@/components/cabinet/cabinet-sidebar'
import { getCurrentUser } from '@/lib/server/get-current-user'

export default async function CabinetLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden md:flex-row">
      <CabinetSidebar />
      <main className="flex-1 overflow-y-auto bg-muted/20 p-4 md:p-6">{children}</main>
    </div>
  )
}
