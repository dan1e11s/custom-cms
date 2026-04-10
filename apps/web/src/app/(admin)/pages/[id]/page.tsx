export default function AdminPageEditorPage({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1 className="text-2xl font-bold">Редактор страницы #{params.id}</h1>
      <p className="mt-1 text-muted-foreground">Конструктор блоков — реализуется в фазе 2.</p>
    </div>
  )
}
