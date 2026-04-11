import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import type { TableBlockData } from '@/types/blocks'

export function TableBlock({ data }: { data: TableBlockData }) {
  return (
    <Section>
      <Container>
        {data.heading && (
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">{data.heading}</h2>
        )}
        <div className="overflow-x-auto rounded-xl border border-gray-200 shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {data.headers.map((header, i) => (
                  <th
                    key={i}
                    className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-gray-500"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {data.rows.map((row, ri) => (
                <tr key={ri} className="hover:bg-gray-50">
                  {row.map((cell, ci) => (
                    <td key={ci} className="whitespace-nowrap px-6 py-4 text-sm text-gray-700">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </Section>
  )
}
