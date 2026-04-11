import type { BlockMeta, BlockType } from '@/types/blocks'

// Метаданные для UI конструктора (шаг 2.4)
export const BLOCK_META: Record<BlockType, BlockMeta> = {
  banner: {
    type: 'banner',
    label: 'Баннер',
    description: 'Главный экран с фоном, заголовком и CTA-кнопками',
    icon: '🖼️',
    defaultData: {
      heading: 'Заголовок страницы',
      subheading: 'Подзаголовок',
      overlay: true,
      textAlign: 'left',
      minHeight: '60vh',
      ctaText: 'Связаться с нами',
      ctaUrl: '#contacts',
    },
  },
  features: {
    type: 'features',
    label: 'Преимущества',
    description: 'Сетка карточек с иконками и текстом',
    icon: '⭐',
    defaultData: {
      heading: 'Наши преимущества',
      columns: 3,
      items: [
        { icon: '✅', title: 'Преимущество 1', text: 'Описание первого преимущества' },
        { icon: '🚀', title: 'Преимущество 2', text: 'Описание второго преимущества' },
        { icon: '💎', title: 'Преимущество 3', text: 'Описание третьего преимущества' },
      ],
    },
  },
  cta: {
    type: 'cta',
    label: 'Призыв к действию',
    description: 'Акцентная секция с кнопкой конверсии',
    icon: '📣',
    defaultData: {
      heading: 'Готовы начать?',
      subheading: 'Оставьте заявку и мы свяжемся с вами',
      background: 'primary',
      ctaText: 'Оставить заявку',
      ctaUrl: '#contacts',
    },
  },
  faq: {
    type: 'faq',
    label: 'FAQ',
    description: 'Аккордеон с вопросами и ответами',
    icon: '❓',
    defaultData: {
      heading: 'Часто задаваемые вопросы',
      items: [
        { question: 'Вопрос 1?', answer: 'Ответ на первый вопрос' },
        { question: 'Вопрос 2?', answer: 'Ответ на второй вопрос' },
      ],
    },
  },
  cards: {
    type: 'cards',
    label: 'Карточки',
    description: 'Сетка карточек товаров или услуг',
    icon: '🗂️',
    defaultData: {
      heading: 'Наши услуги',
      columns: 3,
      items: [
        { title: 'Услуга 1', text: 'Описание услуги' },
        { title: 'Услуга 2', text: 'Описание услуги' },
        { title: 'Услуга 3', text: 'Описание услуги' },
      ],
    },
  },
  info: {
    type: 'info',
    label: 'Текст + фото',
    description: 'Блок с текстом и изображением рядом',
    icon: '📄',
    defaultData: {
      heading: 'О нас',
      text: '<p>Расскажите о своей компании или услуге.</p>',
      imagePosition: 'right',
    },
  },
  reviews: {
    type: 'reviews',
    label: 'Отзывы',
    description: 'Карточки с отзывами клиентов',
    icon: '💬',
    defaultData: {
      heading: 'Отзывы клиентов',
      items: [
        { text: 'Отличный сервис!', author: 'Иван Иванов', rating: 5 },
        { text: 'Рекомендую всем!', author: 'Мария Петрова', rating: 5 },
      ],
    },
  },
  steps: {
    type: 'steps',
    label: 'Шаги',
    description: 'Пронумерованный список этапов работы',
    icon: '📋',
    defaultData: {
      heading: 'Как мы работаем',
      items: [
        { title: 'Шаг 1', text: 'Описание первого шага' },
        { title: 'Шаг 2', text: 'Описание второго шага' },
        { title: 'Шаг 3', text: 'Описание третьего шага' },
      ],
    },
  },
  contacts: {
    type: 'contacts',
    label: 'Контакты',
    description: 'Адрес, телефон, почта и карта',
    icon: '📍',
    defaultData: {
      heading: 'Контакты',
      phone: '+7 (999) 000-00-00',
      email: 'info@example.com',
      address: 'г. Москва, ул. Примерная, 1',
    },
  },
  slider: {
    type: 'slider',
    label: 'Слайдер',
    description: 'Фотогалерея с листанием',
    icon: '🎠',
    defaultData: {
      items: [],
      autoplay: false,
      interval: 4,
    },
  },
  video: {
    type: 'video',
    label: 'Видео',
    description: 'Встроенное YouTube или Vimeo видео',
    icon: '▶️',
    defaultData: {
      url: '',
      aspectRatio: '16/9',
    },
  },
  table: {
    type: 'table',
    label: 'Таблица',
    description: 'Таблица с данными',
    icon: '📊',
    defaultData: {
      headers: ['Колонка 1', 'Колонка 2', 'Колонка 3'],
      rows: [['Ячейка', 'Ячейка', 'Ячейка']],
    },
  },
  cases: {
    type: 'cases',
    label: 'Кейсы',
    description: 'Портфолио выполненных работ',
    icon: '💼',
    defaultData: {
      heading: 'Наши кейсы',
      items: [],
    },
  },
  breadcrumbs: {
    type: 'breadcrumbs',
    label: 'Хлебные крошки',
    description: 'Навигационная цепочка страниц',
    icon: '🔗',
    defaultData: {
      items: [{ label: 'Главная', href: '/' }, { label: 'Текущая страница' }],
    },
  },
}
