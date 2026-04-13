'use client'

import { Trash2, Plus } from 'lucide-react'
import type { TableBlockData } from '@/types/blocks'
import { useEditorStore } from '@/store/editor.store'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface Props {
  blockId: string
  data: TableBlockData
}

export function TableForm({ blockId, data }: Props) {
  const updateBlock = useEditorStore((s) => s.updateBlock)

  function upd(changes: Partial<TableBlockData>) {
    updateBlock(blockId, { data: { ...data, ...changes } })
  }

  function updHeader(index: number, value: string) {
    const headers = data.headers.map((h, i) => (i === index ? value : h))
    upd({ headers })
  }

  function addColumn() {
    const headers = [...data.headers, `Колонка ${data.headers.length + 1}`]
    const rows = data.rows.map((row) => [...row, ''])
    upd({ headers, rows })
  }

  function removeColumn(colIndex: number) {
    const headers = data.headers.filter((_, i) => i !== colIndex)
    const rows = data.rows.map((row) => row.filter((_, i) => i !== colIndex))
    upd({ headers, rows })
  }

  function updCell(rowIndex: number, colIndex: number, value: string) {
    const rows = data.rows.map((row, ri) =>
      ri === rowIndex ? row.map((cell, ci) => (ci === colIndex ? value : cell)) : row,
    )
    upd({ rows })
  }

  function addRow() {
    upd({ rows: [...data.rows, data.headers.map(() => '')] })
  }

  function removeRow(rowIndex: number) {
    upd({ rows: data.rows.filter((_, i) => i !== rowIndex) })
  }

  return (
    <div className="space-y-4">
      <div className="space-y-1.5">
        <Label>Заголовок таблицы</Label>
        <Input
          value={data.heading ?? ''}
          onChange={(e) => upd({ heading: e.target.value })}
          placeholder="Сравнение тарифов"
        />
      </div>

      <div className="space-y-2 border-t pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Заголовки колонок
          </p>
          <Button type="button" variant="outline" size="sm" onClick={addColumn}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Колонка
          </Button>
        </div>
        <div className="space-y-1.5">
          {data.headers.map((header, colIndex) => (
            <div key={colIndex} className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground w-4">{colIndex + 1}</span>
              <Input
                value={header}
                onChange={(e) => updHeader(colIndex, e.target.value)}
                className="flex-1"
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:text-destructive"
                onClick={() => removeColumn(colIndex)}
                disabled={data.headers.length <= 1}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="space-y-2 border-t pt-4">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Строки ({data.rows.length})
          </p>
          <Button type="button" variant="outline" size="sm" onClick={addRow}>
            <Plus className="h-3.5 w-3.5 mr-1" />
            Строка
          </Button>
        </div>

        {data.rows.map((row, rowIndex) => (
          <div key={rowIndex} className="rounded-md border p-2 space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-xs text-muted-foreground">Строка {rowIndex + 1}</span>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="h-6 w-6 hover:text-destructive"
                onClick={() => removeRow(rowIndex)}
              >
                <Trash2 className="h-3.5 w-3.5" />
              </Button>
            </div>
            <div className="space-y-1">
              {row.map((cell, colIndex) => (
                <div key={colIndex} className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground w-20 truncate">
                    {data.headers[colIndex] ?? `Кол. ${colIndex + 1}`}
                  </span>
                  <Input
                    value={cell}
                    onChange={(e) => updCell(rowIndex, colIndex, e.target.value)}
                    className="flex-1"
                    placeholder="Значение ячейки"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
