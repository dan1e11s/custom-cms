import type { BlockConfig } from '@/types/blocks'
import { BLOCK_COMPONENTS } from './index'

interface BlockRendererProps {
  blocks: BlockConfig[]
}

export function BlockRenderer({ blocks }: BlockRendererProps) {
  const sorted = [...blocks].filter((b) => b.enabled).sort((a, b) => a.order - b.order)

  return (
    <>
      {sorted.map((block) => {
        const Component = BLOCK_COMPONENTS[block.type]
        if (!Component) return null
        return <Component key={block.id} data={block.data} />
      })}
    </>
  )
}
