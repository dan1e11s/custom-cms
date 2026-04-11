import { Container } from '@/components/ui/container'
import { Section } from '@/components/ui/section'
import type { VideoBlockData } from '@/types/blocks'

function getEmbedUrl(url: string): string {
  // YouTube
  const ytMatch = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/,
  )
  if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?rel=0`

  // Vimeo
  const vimeoMatch = url.match(/vimeo\.com\/(\d+)/)
  if (vimeoMatch) return `https://player.vimeo.com/video/${vimeoMatch[1]}`

  // Уже embed-ссылка
  return url
}

const ASPECT: Record<string, string> = {
  '16/9': 'aspect-video',
  '4/3': 'aspect-[4/3]',
  '1/1': 'aspect-square',
}

export function VideoBlock({ data }: { data: VideoBlockData }) {
  const embedUrl = getEmbedUrl(data.url)
  const aspect = ASPECT[data.aspectRatio ?? '16/9']

  return (
    <Section>
      <Container>
        {data.heading && (
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">{data.heading}</h2>
        )}
        <div className={`mx-auto max-w-4xl overflow-hidden rounded-xl shadow-lg ${aspect}`}>
          <iframe
            src={embedUrl}
            title={data.heading || 'Видео'}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            className="h-full w-full border-0"
          />
        </div>
      </Container>
    </Section>
  )
}
