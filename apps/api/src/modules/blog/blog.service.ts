import { ConflictException, Injectable, Logger, NotFoundException } from '@nestjs/common'
import { Cron, CronExpression } from '@nestjs/schedule'
import { PageStatus, Prisma } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { generateSlug, isBot } from './blog.utils'
import { CreateCommentDto } from './dto/create-comment.dto'
import { CreatePostDto } from './dto/create-post.dto'
import { FilterPostsDto } from './dto/filter-posts.dto'
import { UpdatePostDto } from './dto/update-post.dto'

const POST_INCLUDE = {
  author: { select: { id: true, username: true, avatar: true } },
  category: { select: { id: true, slug: true, name: true } },
  tags: { select: { id: true, slug: true, name: true } },
}

@Injectable()
export class BlogService {
  private readonly logger = new Logger(BlogService.name)

  constructor(private readonly prisma: PrismaService) {}

  // ══════════════════════════════════════════════════════════════════════════
  //  ПУБЛИЧНЫЕ
  // ══════════════════════════════════════════════════════════════════════════

  async findPublished(dto: FilterPostsDto) {
    const {
      search,
      categorySlug,
      tag,
      page = 1,
      limit = 10,
      sortBy = 'publishedAt',
      sortOrder = 'desc',
    } = dto

    const where: Prisma.BlogPostWhereInput = {
      status: PageStatus.PUBLISHED,
      publishedAt: { lte: new Date() },
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { excerpt: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categorySlug && { category: { slug: categorySlug } }),
      ...(tag && { tags: { some: { slug: tag } } }),
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.blogPost.findMany({
        where,
        include: POST_INCLUDE,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.blogPost.count({ where }),
    ])

    return { items, total, page, limit, pages: Math.ceil(total / limit) }
  }

  async findBySlug(slug: string, userAgent?: string) {
    const post = await this.prisma.blogPost.findFirst({
      where: { slug, status: PageStatus.PUBLISHED, publishedAt: { lte: new Date() } },
      include: {
        ...POST_INCLUDE,
        _count: { select: { comments: true } },
      },
    })
    if (!post) throw new NotFoundException(`Статья "${slug}" не найдена`)

    // Инкремент просмотров в фоне (не блокируем ответ)
    if (!isBot(userAgent)) {
      this.prisma.blogPost
        .update({ where: { id: post.id }, data: { views: { increment: 1 } } })
        .catch(() => {})
    }

    return post
  }

  async getComments(slug: string) {
    const post = await this.prisma.blogPost.findFirst({ where: { slug }, select: { id: true } })
    if (!post) throw new NotFoundException(`Статья "${slug}" не найдена`)

    return this.prisma.comment.findMany({
      where: { blogPostId: post.id, parentId: null, isDeleted: false },
      include: {
        author: { select: { id: true, username: true, avatar: true } },
        replies: {
          where: { isDeleted: false },
          include: { author: { select: { id: true, username: true, avatar: true } } },
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: { createdAt: 'asc' },
    })
  }

  async addComment(slug: string, dto: CreateCommentDto, authorId: number) {
    const post = await this.prisma.blogPost.findFirst({ where: { slug }, select: { id: true } })
    if (!post) throw new NotFoundException(`Статья "${slug}" не найдена`)

    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({ where: { id: dto.parentId } })
      if (!parent || parent.blogPostId !== post.id) {
        throw new NotFoundException('Родительский комментарий не найден')
      }
    }

    return this.prisma.comment.create({
      data: {
        content: dto.content,
        authorId,
        blogPostId: post.id,
        parentId: dto.parentId,
      },
      include: { author: { select: { id: true, username: true, avatar: true } } },
    })
  }

  async getTags() {
    return this.prisma.tag.findMany({
      where: { blogPosts: { some: { status: PageStatus.PUBLISHED } } },
      orderBy: { name: 'asc' },
    })
  }

  async getBlogCategories() {
    return this.prisma.category.findMany({
      where: { type: 'blog' },
      orderBy: { name: 'asc' },
    })
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  ADMIN
  // ══════════════════════════════════════════════════════════════════════════

  async findAll(dto: FilterPostsDto) {
    const {
      search,
      categorySlug,
      tag,
      page = 1,
      limit = 20,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = dto

    const where: Prisma.BlogPostWhereInput = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { slug: { contains: search, mode: 'insensitive' } },
        ],
      }),
      ...(categorySlug && { category: { slug: categorySlug } }),
      ...(tag && { tags: { some: { slug: tag } } }),
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.blogPost.findMany({
        where,
        include: POST_INCLUDE,
        orderBy: { [sortBy]: sortOrder },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.blogPost.count({ where }),
    ])

    return { items, total, page, limit, pages: Math.ceil(total / limit) }
  }

  async findById(id: number) {
    const post = await this.prisma.blogPost.findUnique({
      where: { id },
      include: POST_INCLUDE,
    })
    if (!post) throw new NotFoundException(`Статья #${id} не найдена`)
    return post
  }

  async create(dto: CreatePostDto, authorId: number) {
    const slug = dto.slug || generateSlug(dto.title)
    await this.ensureSlugUnique(slug)

    const tags = await this.upsertTags(dto.tags ?? [])

    return this.prisma.blogPost.create({
      data: {
        title: dto.title,
        slug,
        excerpt: dto.excerpt,
        content: dto.content,
        coverImage: dto.coverImage,
        categoryId: dto.categoryId,
        status: dto.status ?? PageStatus.DRAFT,
        publishedAt: dto.publishedAt ? new Date(dto.publishedAt) : null,
        seoTitle: dto.seoTitle,
        seoDesc: dto.seoDesc,
        authorId,
        tags: { connect: tags.map((t) => ({ id: t.id })) },
      },
      include: POST_INCLUDE,
    })
  }

  async update(id: number, dto: UpdatePostDto) {
    await this.findById(id)

    if (dto.slug) await this.ensureSlugUnique(dto.slug, id)

    const data: Prisma.BlogPostUpdateInput = {
      ...(dto.title !== undefined && { title: dto.title }),
      ...(dto.slug !== undefined && { slug: dto.slug }),
      ...(dto.excerpt !== undefined && { excerpt: dto.excerpt }),
      ...(dto.content !== undefined && { content: dto.content }),
      ...(dto.coverImage !== undefined && { coverImage: dto.coverImage }),
      // Используем truthy-проверку: 0 и undefined оба пропускаются
      ...(dto.categoryId &&
        dto.categoryId > 0 && { category: { connect: { id: dto.categoryId } } }),
      ...(dto.seoTitle !== undefined && { seoTitle: dto.seoTitle }),
      ...(dto.seoDesc !== undefined && { seoDesc: dto.seoDesc }),
      ...(dto.publishedAt !== undefined && { publishedAt: new Date(dto.publishedAt) }),
    }

    if (dto.tags !== undefined) {
      const tags = await this.upsertTags(dto.tags)
      data.tags = { set: tags.map((t) => ({ id: t.id })) }
    }

    return this.prisma.blogPost.update({ where: { id }, data, include: POST_INCLUDE })
  }

  async publish(id: number) {
    await this.findById(id)
    return this.prisma.blogPost.update({
      where: { id },
      data: { status: PageStatus.PUBLISHED, publishedAt: new Date() },
      include: POST_INCLUDE,
    })
  }

  async unpublish(id: number) {
    await this.findById(id)
    return this.prisma.blogPost.update({
      where: { id },
      data: { status: PageStatus.DRAFT },
      include: POST_INCLUDE,
    })
  }

  async schedulePublish(id: number, publishAt: Date) {
    await this.findById(id)
    return this.prisma.blogPost.update({
      where: { id },
      data: { publishedAt: publishAt, status: PageStatus.DRAFT },
      include: POST_INCLUDE,
    })
  }

  async remove(id: number) {
    await this.findById(id)
    await this.prisma.blogPost.delete({ where: { id } })
    return { success: true }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  CRON: авто-публикация по расписанию
  // ══════════════════════════════════════════════════════════════════════════

  @Cron(CronExpression.EVERY_MINUTE)
  async publishScheduled() {
    const due = await this.prisma.blogPost.findMany({
      where: {
        status: PageStatus.DRAFT,
        publishedAt: { lte: new Date(), not: null },
      },
      select: { id: true, title: true },
    })

    if (due.length === 0) return

    await this.prisma.blogPost.updateMany({
      where: { id: { in: due.map((p) => p.id) } },
      data: { status: PageStatus.PUBLISHED },
    })

    this.logger.log(`Auto-published ${due.length} post(s): ${due.map((p) => p.title).join(', ')}`)
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  Приватные утилиты
  // ══════════════════════════════════════════════════════════════════════════

  private async upsertTags(slugsOrNames: string[]) {
    return Promise.all(
      slugsOrNames.map((name) => {
        const slug = generateSlug(name)
        return this.prisma.tag.upsert({
          where: { slug },
          create: { slug, name },
          update: {},
        })
      }),
    )
  }

  private async ensureSlugUnique(slug: string, excludeId?: number) {
    const existing = await this.prisma.blogPost.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    })
    if (existing) throw new ConflictException(`Slug "${slug}" уже занят`)
  }
}
