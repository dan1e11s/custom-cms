import {
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { AppGateway } from '../websockets/app.gateway'
import { CreateForumPostDto } from './dto/create-forum-post.dto'
import { CreateSectionDto } from './dto/create-section.dto'
import { CreateThreadDto } from './dto/create-thread.dto'
import { GetPostsDto } from './dto/get-posts.dto'
import { GetThreadsDto } from './dto/get-threads.dto'
import { PinLockThreadDto } from './dto/pin-lock-thread.dto'
import { UpdateSectionDto } from './dto/update-section.dto'
import { UpdateThreadDto } from './dto/update-thread.dto'
import { generateSlug, sanitizeForumContent } from './forum.utils'

const AUTHOR_SELECT = { id: true, username: true, avatar: true }

const THREAD_INCLUDE = {
  section: { select: { id: true, slug: true, title: true } },
  author: { select: AUTHOR_SELECT },
  _count: { select: { posts: true } },
}

const POST_INCLUDE = {
  author: { select: AUTHOR_SELECT },
  _count: { select: { comments: true } },
}

@Injectable()
export class ForumService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: AppGateway,
  ) {}

  // ══════════════════════════════════════════════════════════════════════════
  //  РАЗДЕЛЫ
  // ══════════════════════════════════════════════════════════════════════════

  async getSections() {
    return this.prisma.forumSection.findMany({
      orderBy: { order: 'asc' },
      include: {
        _count: { select: { threads: true } },
      },
    })
  }

  async getSectionBySlug(slug: string) {
    const section = await this.prisma.forumSection.findUnique({
      where: { slug },
      include: { _count: { select: { threads: true } } },
    })
    if (!section) throw new NotFoundException(`Раздел "${slug}" не найден`)
    return section
  }

  async createSection(dto: CreateSectionDto) {
    const slug = dto.slug ?? generateSlug(dto.title)
    await this.ensureSectionSlugUnique(slug)

    return this.prisma.forumSection.create({
      data: {
        title: dto.title,
        slug,
        description: dto.description,
        order: dto.order ?? 0,
      },
    })
  }

  async updateSection(id: number, dto: UpdateSectionDto) {
    await this.findSectionById(id)

    if (dto.slug) await this.ensureSectionSlugUnique(dto.slug, id)

    return this.prisma.forumSection.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.order !== undefined && { order: dto.order }),
      },
    })
  }

  async deleteSection(id: number) {
    await this.findSectionById(id)
    await this.prisma.forumSection.delete({ where: { id } })
    return { success: true }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  ТЕМЫ
  // ══════════════════════════════════════════════════════════════════════════

  async getThreads(sectionSlug: string, dto: GetThreadsDto) {
    const section = await this.getSectionBySlug(sectionSlug)
    const { page = 1, limit = 20 } = dto

    const [items, total] = await this.prisma.$transaction([
      this.prisma.forumThread.findMany({
        where: { sectionId: section.id },
        include: THREAD_INCLUDE,
        orderBy: [{ isPinned: 'desc' }, { lastPostAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.forumThread.count({ where: { sectionId: section.id } }),
    ])

    return { items, total, page, limit, pages: Math.ceil(total / limit) }
  }

  async getThreadBySlug(slug: string) {
    const thread = await this.prisma.forumThread.findUnique({
      where: { slug },
      include: THREAD_INCLUDE,
    })
    if (!thread) throw new NotFoundException(`Тема "${slug}" не найдена`)

    // Инкремент просмотров в фоне
    this.prisma.forumThread
      .update({ where: { id: thread.id }, data: { views: { increment: 1 } } })
      .catch(() => {})

    return thread
  }

  async createThread(dto: CreateThreadDto, userId: number) {
    await this.findSectionById(dto.sectionId)

    const slug = await this.generateUniqueThreadSlug(dto.title)
    const cleanContent = sanitizeForumContent(dto.content)

    const thread = await this.prisma.forumThread.create({
      data: {
        title: dto.title,
        slug,
        sectionId: dto.sectionId,
        authorId: userId,
        posts: {
          create: {
            content: cleanContent,
            authorId: userId,
          },
        },
      },
      include: THREAD_INCLUDE,
    })

    return thread
  }

  async updateThread(id: number, dto: UpdateThreadDto, userId: number, userRole: string) {
    const thread = await this.findThreadById(id)

    if (thread.authorId !== userId && userRole !== 'ADMIN') {
      throw new ForbiddenException('Нельзя редактировать чужую тему')
    }

    if (dto.title) {
      const slug = await this.generateUniqueThreadSlug(dto.title, id)
      return this.prisma.forumThread.update({
        where: { id },
        data: { title: dto.title, slug },
        include: THREAD_INCLUDE,
      })
    }

    return thread
  }

  async deleteThread(id: number, userId: number, userRole: string) {
    const thread = await this.findThreadById(id)

    if (userRole !== 'ADMIN' && thread.authorId !== userId) {
      throw new ForbiddenException('Удалять темы может только администратор')
    }

    await this.prisma.forumThread.delete({ where: { id } })
    return { success: true }
  }

  async pinLockThread(id: number, dto: PinLockThreadDto) {
    await this.findThreadById(id)

    return this.prisma.forumThread.update({
      where: { id },
      data: {
        ...(dto.isPinned !== undefined && { isPinned: dto.isPinned }),
        ...(dto.isLocked !== undefined && { isLocked: dto.isLocked }),
      },
      include: THREAD_INCLUDE,
    })
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  СООБЩЕНИЯ
  // ══════════════════════════════════════════════════════════════════════════

  async getPosts(threadSlug: string, dto: GetPostsDto) {
    const thread = await this.prisma.forumThread.findUnique({
      where: { slug: threadSlug },
      select: { id: true },
    })
    if (!thread) throw new NotFoundException(`Тема "${threadSlug}" не найдена`)

    const { page = 1, limit = 20 } = dto

    const [items, total] = await this.prisma.$transaction([
      this.prisma.forumPost.findMany({
        where: { threadId: thread.id, isDeleted: false },
        include: POST_INCLUDE,
        orderBy: { createdAt: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.forumPost.count({ where: { threadId: thread.id, isDeleted: false } }),
    ])

    return { items, total, page, limit, pages: Math.ceil(total / limit) }
  }

  async addPost(threadId: number, dto: CreateForumPostDto, userId: number) {
    const thread = await this.findThreadById(threadId)

    if (thread.isLocked) {
      throw new ForbiddenException('Тема закрыта для ответов')
    }

    let content = sanitizeForumContent(dto.content)

    // Если это цитата — добавляем blockquote с данными оригинального поста
    if (dto.quotePostId) {
      const quoted = await this.prisma.forumPost.findUnique({
        where: { id: dto.quotePostId },
        include: { author: { select: { username: true } } },
      })
      if (quoted && !quoted.isDeleted) {
        content = `<blockquote data-author="${quoted.author.username}" data-post-id="${quoted.id}">${quoted.content}</blockquote>${content}`
      }
    }

    const [post] = await this.prisma.$transaction([
      this.prisma.forumPost.create({
        data: { content, threadId, authorId: userId },
        include: POST_INCLUDE,
      }),
      this.prisma.forumThread.update({
        where: { id: threadId },
        data: { lastPostAt: new Date() },
      }),
    ])

    // Real-time: новый пост в теме
    this.gateway.emit(`forum:thread:${threadId}`, 'forum:new_post', post)

    return post
  }

  async deletePost(postId: number, userId: number, userRole: string) {
    const post = await this.prisma.forumPost.findUnique({
      where: { id: postId },
      include: { author: { select: { id: true } } },
    })
    if (!post) throw new NotFoundException(`Сообщение #${postId} не найдено`)

    if (post.author.id !== userId && userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
      throw new ForbiddenException('Нельзя удалить чужое сообщение')
    }

    // Мягкое удаление
    await this.prisma.forumPost.update({
      where: { id: postId },
      data: { isDeleted: true },
    })

    return { success: true }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  Приватные утилиты
  // ══════════════════════════════════════════════════════════════════════════

  private async findSectionById(id: number) {
    const section = await this.prisma.forumSection.findUnique({ where: { id } })
    if (!section) throw new NotFoundException(`Раздел #${id} не найден`)
    return section
  }

  private async findThreadById(id: number) {
    const thread = await this.prisma.forumThread.findUnique({
      where: { id },
      include: THREAD_INCLUDE,
    })
    if (!thread) throw new NotFoundException(`Тема #${id} не найдена`)
    return thread
  }

  private async ensureSectionSlugUnique(slug: string, excludeId?: number) {
    const existing = await this.prisma.forumSection.findFirst({
      where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
    })
    if (existing) throw new ConflictException(`Slug раздела "${slug}" уже занят`)
  }

  private async generateUniqueThreadSlug(title: string, excludeId?: number): Promise<string> {
    const base = generateSlug(title)
    let slug = base
    let counter = 1

    for (;;) {
      const existing = await this.prisma.forumThread.findFirst({
        where: { slug, ...(excludeId ? { NOT: { id: excludeId } } : {}) },
      })
      if (!existing) break
      slug = `${base}-${counter++}`
    }

    return slug
  }
}
