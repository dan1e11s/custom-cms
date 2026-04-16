/**
 * Минимальный toast без внешних зависимостей.
 * Рендерит DOM-элемент в body, автоматически скрывает через 3 секунды.
 */

type ToastType = 'success' | 'error' | 'info'

const COLORS: Record<ToastType, string> = {
  success: '#10B981',
  error: '#EF4444',
  info: '#2563EB',
}

function show(message: string, type: ToastType = 'info') {
  if (typeof window === 'undefined') return

  const el = document.createElement('div')
  el.textContent = message
  el.style.cssText = [
    'position:fixed',
    'bottom:1.5rem',
    'right:1.5rem',
    'z-index:9999',
    'padding:0.75rem 1.25rem',
    'border-radius:0.5rem',
    'font-size:0.875rem',
    'font-weight:500',
    'color:#fff',
    'box-shadow:0 4px 12px rgba(0,0,0,.25)',
    'pointer-events:none',
    'opacity:0',
    'transition:opacity 0.2s ease',
    `background:${COLORS[type]}`,
  ].join(';')

  document.body.appendChild(el)

  requestAnimationFrame(() => {
    el.style.opacity = '1'
  })

  setTimeout(() => {
    el.style.opacity = '0'
    setTimeout(() => el.remove(), 200)
  }, 3000)
}

export const toast = {
  success: (msg: string) => show(msg, 'success'),
  error: (msg: string) => show(msg, 'error'),
  info: (msg: string) => show(msg, 'info'),
}
