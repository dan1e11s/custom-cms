'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'

interface FadeInProps {
  children: React.ReactNode
  delay?: number
  className?: string
  as?: keyof typeof motion
}

export function FadeIn({ children, delay = 0, className }: FadeInProps) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: '-40px 0px' })

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: 18 }}
      animate={inView ? { opacity: 1, y: 0 } : undefined}
      transition={{ duration: 0.4, ease: 'easeOut', delay }}
    >
      {children}
    </motion.div>
  )
}

// ── Stagger-контейнер для списков ─────────────────────────────────────────────

const staggerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
}

interface FadeInStaggerProps {
  children: React.ReactNode
  className?: string
}

export function FadeInStagger({ children, className }: FadeInStaggerProps) {
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      variants={staggerVariants}
    >
      {children}
    </motion.div>
  )
}

// ── Вариант для дочерних элементов FadeInStagger ──────────────────────────────

export const fadeInItem = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

// ── Обёртка-элемент для FadeInStagger ─────────────────────────────────────────

export function FadeInItem({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <motion.div variants={fadeInItem} className={className}>
      {children}
    </motion.div>
  )
}
