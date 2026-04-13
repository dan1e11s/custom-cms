import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { Eye, Calendar, User, ChevronLeft, ChevronRight } from 'lucide-react'
import { Container } from '@/components/ui/container'
import { Badge } from '@/components/ui/badge'
import { PostCard } from '@/components/blog/PostCard'
import { Comments } from '@/components/blog/Comments'
import { blogServerApi } from '@/lib/api/blog'
import { buildArticleSchema, buildArticleBreadcrumbSchema } from '@/lib/seo/json-ld'
import { BASE_URL, SITE_NAME } from '@/lib/seo/config'
import type { BlogPost, BlogListResponse } from '@/types/blog'

export const revalidate = 3600

interface Props {
  params: { slug: string }
}

// ── Статические пути ──────────────────────────────────────────────────────────

export async function generateStaticParams() {
  try {
    const data = await blogServerApi.getPosts({ limit: 100 }, { revalidate: false })
    return data.items.map((p) => ({ slug: p.slug }))
  } catch {
    return []
  }
}

// ── Метаданные ────────────────────────────────────────────────────────────────

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const post = await blogServerApi.getPostBySlug(params.slug, {
      tags: [`blog-${params.slug}`],
      revalidate,
    })
    const title = post.seoTitle || `${post.title} | ${SITE_NAME}`
    const description = post.seoDesc || post.excerpt || `Читать статью «${post.title}»`
    const canonical = `${BASE_URL}/blog/${post.slug}`

    return {
      title,
      description,
      alternates: { canonical },
      openGraph: {
        title,
        description,
        url: canonical,
        type: 'article',
        publishedTime: post.publishedAt ?? post.createdAt,
        authors: [post.author.username],
        images: post.coverImage ? [{ url: post.coverImage, width: 1200, height: 630 }] : [],
      },
    }
  } catch {
    return { title: 'Статья не найдена' }
  }
}

// ── Страница ──────────────────────────────────────────────────────────────────

export default async function BlogPostPage({ params }: Props) {
  let post: BlogPost

  try {
    post = await blogServerApi.getPostBySlug(params.slug, {
      tags: [`blog-${params.slug}`],
      revalidate,
    })
  } catch {
    notFound()
  }

  // Похожие статьи по первому тегу
  const related = post.tags[0]
    ? await blogServerApi
        .getPosts({ tag: post.tags[0].slug, limit: 4 }, { revalidate })
        .then((r: BlogListResponse) => r.items.filter((p) => p.slug !== post.slug).slice(0, 3))
        .catch(() => [] as BlogPost[])
    : ([] as BlogPost[])

  // Навигация: соседние статьи (по дате)
  const navData = await blogServerApi
    .getPosts({ sortBy: 'publishedAt', sortOrder: 'desc', limit: 20 }, { revalidate })
    .catch((): BlogListResponse => ({ items: [], total: 0, page: 1, limit: 20, pages: 0 }))

  const allSlugs = navData.items.map((p) => p.slug)
  const currentIdx = allSlugs.indexOf(post.slug)
  const prevPost = currentIdx > 0 ? navData.items[currentIdx - 1] : null
  const nextPost =
    currentIdx >= 0 && currentIdx < allSlugs.length - 1 ? navData.items[currentIdx + 1] : null

  const articleSchema = buildArticleSchema(post)
  const breadcrumbSchema = buildArticleBreadcrumbSchema(post)

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <Container className="py-8">
        <div className="mx-auto max-w-3xl">
          {/* Хлебные крошки */}
          <nav className="mb-6 flex items-center gap-2 text-sm text-muted-foreground">
            <Link href="/" className="hover:text-foreground">
              Главная
            </Link>
            <span>/</span>
            <Link href="/blog" className="hover:text-foreground">
              Блог
            </Link>
            {post.category && (
              <>
                <span>/</span>
                <Link
                  href={`/blog?categorySlug=${post.category.slug}`}
                  className="hover:text-foreground"
                >
                  {post.category.name}
                </Link>
              </>
            )}
            <span>/</span>
            <span className="truncate text-foreground">{post.title}</span>
          </nav>

          {/* Теги */}
          {post.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <Link key={tag.id} href={`/blog?tag=${tag.slug}`}>
                  <Badge variant="outline" className="text-xs hover:bg-muted">
                    #{tag.name}
                  </Badge>
                </Link>
              ))}
            </div>
          )}

          {/* Заголовок */}
          <h1 className="mb-4 text-3xl font-bold leading-tight sm:text-4xl">{post.title}</h1>

          {/* Мета */}
          <div className="mb-6 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author.username}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              <time dateTime={post.publishedAt ?? post.createdAt}>
                {new Date(post.publishedAt ?? post.createdAt).toLocaleDateString('ru-RU', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                })}
              </time>
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {post.views} просмотров
            </span>
          </div>

          {/* Обложка */}
          {post.coverImage && (
            <div className="relative mb-8 aspect-[16/9] overflow-hidden rounded-xl">
              <Image
                src={post.coverImage}
                alt={post.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 768px"
                className="object-cover"
              />
            </div>
          )}

          {/* Excerpt */}
          {post.excerpt && (
            <p className="mb-8 text-lg leading-relaxed text-muted-foreground border-l-4 border-primary/30 pl-4 italic">
              {post.excerpt}
            </p>
          )}

          {/* Контент из Tiptap (HTML) */}
          <div
            className="prose prose-neutral max-w-none dark:prose-invert prose-headings:font-bold prose-a:text-primary prose-img:rounded-lg"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Навигация prev / next */}
          {(prevPost || nextPost) && (
            <nav className="mt-12 grid grid-cols-2 gap-4 border-t pt-8">
              <div>
                {prevPost && (
                  <Link
                    href={`/blog/${prevPost.slug}`}
                    className="group flex flex-col gap-1 rounded-lg border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
                  >
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      <ChevronLeft className="h-3.5 w-3.5" />
                      Предыдущая
                    </span>
                    <span className="line-clamp-2 text-sm font-medium group-hover:text-primary">
                      {prevPost.title}
                    </span>
                  </Link>
                )}
              </div>
              <div className="flex justify-end">
                {nextPost && (
                  <Link
                    href={`/blog/${nextPost.slug}`}
                    className="group flex flex-col items-end gap-1 rounded-lg border p-4 transition-colors hover:border-primary/50 hover:bg-muted/50"
                  >
                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                      Следующая
                      <ChevronRight className="h-3.5 w-3.5" />
                    </span>
                    <span className="line-clamp-2 text-sm font-medium group-hover:text-primary">
                      {nextPost.title}
                    </span>
                  </Link>
                )}
              </div>
            </nav>
          )}

          {/* Комментарии — CSR */}
          <div className="mt-12 border-t pt-8">
            <Comments slug={post.slug} />
          </div>
        </div>
      </Container>

      {/* Похожие статьи */}
      {related.length > 0 && (
        <div className="border-t bg-muted/30 py-12">
          <Container>
            <h2 className="mb-6 text-xl font-bold">Похожие статьи</h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
            </div>
          </Container>
        </div>
      )}
    </>
  )
}
