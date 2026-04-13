import Link from 'next/link'
import Image from 'next/image'
import { Eye, MessageCircle } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import type { BlogPost } from '@/types/blog'

interface PostCardProps {
  post: BlogPost
  className?: string
}

function formatDate(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('ru-RU', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

export function PostCard({ post, className }: PostCardProps) {
  return (
    <article
      className={cn(
        'group flex flex-col overflow-hidden rounded-lg border bg-card transition-shadow hover:shadow-md',
        className,
      )}
    >
      {/* Обложка */}
      <Link href={`/blog/${post.slug}`} className="block">
        <div className="relative aspect-[16/9] overflow-hidden bg-muted">
          {post.coverImage ? (
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-muted-foreground/30">
              <svg className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
          )}
        </div>
      </Link>

      {/* Контент */}
      <div className="flex flex-1 flex-col gap-3 p-4">
        {/* Категория + теги */}
        <div className="flex flex-wrap gap-1.5">
          {post.category && (
            <Link href={`/blog?categorySlug=${post.category.slug}`}>
              <Badge variant="secondary" className="text-xs hover:bg-secondary/80">
                {post.category.name}
              </Badge>
            </Link>
          )}
          {post.tags.slice(0, 2).map((tag) => (
            <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
              <Badge variant="outline" className="text-xs hover:bg-muted">
                #{tag.name}
              </Badge>
            </Link>
          ))}
        </div>

        {/* Заголовок */}
        <Link href={`/blog/${post.slug}`}>
          <h2 className="line-clamp-2 text-base font-semibold leading-snug group-hover:text-primary">
            {post.title}
          </h2>
        </Link>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="line-clamp-2 text-sm text-muted-foreground">{post.excerpt}</p>
        )}

        {/* Мета */}
        <div className="mt-auto flex items-center justify-between pt-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span>{post.author.username}</span>
            <span>·</span>
            <time dateTime={post.publishedAt ?? post.createdAt}>
              {formatDate(post.publishedAt ?? post.createdAt)}
            </time>
          </div>
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Eye className="h-3.5 w-3.5" />
              {post.views}
            </span>
            {post._count && (
              <span className="flex items-center gap-1">
                <MessageCircle className="h-3.5 w-3.5" />
                {post._count.comments}
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
