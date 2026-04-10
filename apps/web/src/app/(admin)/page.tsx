import { redirect } from 'next/navigation'

// Этот файл находится по неправильному URL (/).
// Реальная страница /admin — в папке admin/page.tsx
export default function AdminRootPage() {
  redirect('/admin')
}
