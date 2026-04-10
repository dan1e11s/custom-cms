import { cn } from '@/lib/utils'

interface SectionProps {
  children: React.ReactNode
  className?: string
  as?: React.ElementType
}

export function Section({ children, className, as: Tag = 'section' }: SectionProps) {
  return <Tag className={cn('py-16 md:py-24', className)}>{children}</Tag>
}
