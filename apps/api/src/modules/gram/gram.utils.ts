import * as sanitizeHtml from 'sanitize-html'

const RU_TRANSLIT: Record<string, string> = {
  а: 'a',
  б: 'b',
  в: 'v',
  г: 'g',
  д: 'd',
  е: 'e',
  ё: 'yo',
  ж: 'zh',
  з: 'z',
  и: 'i',
  й: 'j',
  к: 'k',
  л: 'l',
  м: 'm',
  н: 'n',
  о: 'o',
  п: 'p',
  р: 'r',
  с: 's',
  т: 't',
  у: 'u',
  ф: 'f',
  х: 'kh',
  ц: 'ts',
  ч: 'ch',
  ш: 'sh',
  щ: 'shch',
  ъ: '',
  ы: 'y',
  ь: '',
  э: 'e',
  ю: 'yu',
  я: 'ya',
}

/** Транслитерация русского текста в латиницу для slug */
function toSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[а-яё]/g, (c) => RU_TRANSLIT[c] ?? c)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/**
 * Извлекает хэштеги из текста.
 * Поддерживает латиницу и кириллицу: #привет #hello #тест123
 */
export function extractHashtags(text: string): string[] {
  const matches = text.match(/#[\wа-яёА-ЯЁ]+/gu) ?? []
  const unique = [...new Set(matches.map((t) => toSlug(t.slice(1))))]
  return unique.filter(Boolean)
}

/**
 * Очищает HTML — оставляет только plain text.
 * Используется для контента Gram постов.
 */
export function sanitizeContent(html: string): string {
  return sanitizeHtml(html, {
    allowedTags: [],
    allowedAttributes: {},
  }).trim()
}
