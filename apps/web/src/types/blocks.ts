// ─── Общий тип конфигурации блока ────────────────────────────────────────────

export type BlockType =
  | 'banner'
  | 'slider'
  | 'video'
  | 'features'
  | 'info'
  | 'cards'
  | 'table'
  | 'steps'
  | 'cases'
  | 'reviews'
  | 'faq'
  | 'cta'
  | 'contacts'
  | 'breadcrumbs'

export interface BlockConfig {
  id: string
  type: BlockType
  order: number
  enabled: boolean
  data: BlockData
}

// ─── Данные блоков ────────────────────────────────────────────────────────────

export interface BannerBlockData {
  heading: string
  subheading?: string
  description?: string
  backgroundImage?: string
  overlay?: boolean
  textAlign?: 'left' | 'center' | 'right'
  minHeight?: '40vh' | '60vh' | '80vh' | '100vh'
  ctaText?: string
  ctaUrl?: string
  ctaSecondaryText?: string
  ctaSecondaryUrl?: string
}

export interface FeatureItem {
  icon?: string
  title: string
  text: string
}

export interface FeaturesBlockData {
  heading?: string
  subheading?: string
  columns?: 2 | 3 | 4
  items: FeatureItem[]
}

export interface CtaBlockData {
  heading: string
  subheading?: string
  background?: 'primary' | 'dark' | 'light'
  ctaText: string
  ctaUrl?: string
  ctaSecondaryText?: string
  ctaSecondaryUrl?: string
}

export interface FaqItem {
  question: string
  answer: string
}

export interface FaqBlockData {
  heading?: string
  items: FaqItem[]
}

export interface CardItem {
  image?: string
  title: string
  text?: string
  price?: string
  badge?: string
  link?: string
  linkText?: string
}

export interface CardsBlockData {
  heading?: string
  subheading?: string
  columns?: 2 | 3 | 4
  items: CardItem[]
}

export interface InfoBlockData {
  heading?: string
  text: string
  image?: string
  imageAlt?: string
  imagePosition?: 'left' | 'right'
  ctaText?: string
  ctaUrl?: string
}

export interface ReviewItem {
  text: string
  author: string
  role?: string
  avatar?: string
  rating?: number
}

export interface ReviewsBlockData {
  heading?: string
  items: ReviewItem[]
}

export interface StepItem {
  title: string
  text?: string
}

export interface StepsBlockData {
  heading?: string
  subheading?: string
  items: StepItem[]
}

export interface SocialLink {
  name: string
  url: string
}

export interface ContactsBlockData {
  heading?: string
  address?: string
  phone?: string
  email?: string
  workingHours?: string
  mapEmbed?: string
  socials?: SocialLink[]
}

export interface SliderItem {
  image: string
  alt?: string
  caption?: string
}

export interface SliderBlockData {
  heading?: string
  items: SliderItem[]
  autoplay?: boolean
  interval?: number
}

export interface VideoBlockData {
  heading?: string
  url: string
  aspectRatio?: '16/9' | '4/3' | '1/1'
}

export interface TableBlockData {
  heading?: string
  headers: string[]
  rows: string[][]
}

export interface CaseItem {
  image?: string
  title: string
  category?: string
  text?: string
  link?: string
}

export interface CasesBlockData {
  heading?: string
  subheading?: string
  items: CaseItem[]
}

export interface BreadcrumbItem {
  label: string
  href?: string
}

export interface BreadcrumbsBlockData {
  items: BreadcrumbItem[]
}

// ─── Union type для data ──────────────────────────────────────────────────────

export type BlockData =
  | BannerBlockData
  | FeaturesBlockData
  | CtaBlockData
  | FaqBlockData
  | CardsBlockData
  | InfoBlockData
  | ReviewsBlockData
  | StepsBlockData
  | ContactsBlockData
  | SliderBlockData
  | VideoBlockData
  | TableBlockData
  | CasesBlockData
  | BreadcrumbsBlockData

// ─── Метаданные блока (для реестра в конструкторе) ───────────────────────────

export interface BlockMeta {
  type: BlockType
  label: string
  description: string
  icon: string
  defaultData: BlockData
}
