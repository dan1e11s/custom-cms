import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { PageStatus } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { AppGateway } from '../websockets/app.gateway'
import { NotificationsService } from '../notifications/notifications.service'
import { CreateGramCommentDto } from './dto/create-gram-comment.dto'
import { CreateGramPostDto } from './dto/create-gram-post.dto'
import { GetFeedDto } from './dto/get-feed.dto'
import { extractHashtags, sanitizeContent } from './gram.utils'

const POST_INCLUDE = {
  author: { select: { id: true, username: true, avatar: true } },
  tags: { select: { id: true, slug: true, name: true } },
  _count: { select: { likes: true, comments: true } },
}

@Injectable()
export class GramService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly gateway: AppGateway,
    private readonly notifications: NotificationsService,
  ) {}

  // ══════════════════════════════════════════════════════════════════════════
  //  ЛЕНТА
  // ══════════════════════════════════════════════════════════════════════════

  async getFeed(dto: GetFeedDto) {
    const limit = dto.limit ?? 20

    const posts = await this.prisma.gramPost.findMany({
      where: {
        status: PageStatus.PUBLISHED,
        ...(dto.cursor ? { id: { lt: dto.cursor } } : {}),
      },
      take: limit + 1,
      orderBy: { createdAt: 'desc' },
      include: POST_INCLUDE,
    })

    const hasMore = posts.length > limit
    return {
      posts: posts.slice(0, limit),
      nextCursor: hasMore ? posts[limit - 1].id : undefined,
    }
  }

  async getPostById(id: number) {
    const post = await this.prisma.gramPost.findUnique({
      where: { id },
      include: POST_INCLUDE,
    })
    if (!post) throw new NotFoundException(`Пост #${id} не найден`)
    return post
  }

  async getPostsByTag(tag: string) {
    return this.prisma.gramPost.findMany({
      where: {
        status: PageStatus.PUBLISHED,
        tags: { some: { slug: tag } },
      },
      take: 30,
      orderBy: { createdAt: 'desc' },
      include: POST_INCLUDE,
    })
  }

  async getUserPosts(userId: number) {
    return this.prisma.gramPost.findMany({
      where: { authorId: userId, status: PageStatus.PUBLISHED },
      orderBy: { createdAt: 'desc' },
      include: POST_INCLUDE,
    })
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  СОЗДАНИЕ / УДАЛЕНИЕ ПОСТОВ
  // ══════════════════════════════════════════════════════════════════════════

  async createPost(dto: CreateGramPostDto, userId: number) {
    const cleanContent = sanitizeContent(dto.content)
    const hashtagSlugs = extractHashtags(dto.content)

    // Upsert тегов
    const tags = await Promise.all(
      hashtagSlugs.map((slug) =>
        this.prisma.tag.upsert({
          where: { slug },
          create: { slug, name: slug },
          update: {},
        }),
      ),
    )

    const post = await this.prisma.gramPost.create({
      data: {
        content: cleanContent,
        images: dto.images ?? [],
        authorId: userId,
        status: PageStatus.PUBLISHED,
        tags: { connect: tags.map((t) => ({ id: t.id })) },
      },
      include: POST_INCLUDE,
    })

    // Уведомляем всех в ленте о новом посте
    this.gateway.emit('gram:feed', 'gram:new_post', post)

    return post
  }

  async deletePost(id: number, userId: number, userRole: string) {
    const post = await this.getPostById(id)

    if (post.author.id !== userId && userRole !== 'ADMIN' && userRole !== 'MODERATOR') {
      throw new ForbiddenException('Нельзя удалить чужой пост')
    }

    await this.prisma.gramPost.delete({ where: { id } })
    return { success: true }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  ЛАЙКИ
  // ══════════════════════════════════════════════════════════════════════════

  async toggleLike(postId: number, userId: number) {
    const post = await this.getPostById(postId)

    const existing = await this.prisma.like.findUnique({
      where: { userId_gramPostId: { userId, gramPostId: postId } },
    })

    if (existing) {
      await this.prisma.like.delete({ where: { id: existing.id } })
    } else {
      await this.prisma.like.create({ data: { userId, gramPostId: postId } })

      // Уведомление автору поста о новом лайке
      const actor = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { username: true },
      })
      this.notifications
        .notify(post.author.id, userId, 'like', {
          actorName: actor?.username ?? '...',
          text: 'поставил лайк на ваш пост',
          url: `/gram`,
        })
        .catch(() => {})
    }

    const count = await this.prisma.like.count({ where: { gramPostId: postId } })

    // Real-time обновление счётчика у всех в ленте
    this.gateway.emit('gram:feed', 'gram:like_update', { postId, count })

    return { liked: !existing, count }
  }

  async getLikeStatus(postId: number, userId: number) {
    const like = await this.prisma.like.findUnique({
      where: { userId_gramPostId: { userId, gramPostId: postId } },
    })
    const count = await this.prisma.like.count({ where: { gramPostId: postId } })
    return { liked: !!like, count }
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  КОММЕНТАРИИ
  // ══════════════════════════════════════════════════════════════════════════

  async getComments(postId: number) {
    await this.getPostById(postId)

    return this.prisma.comment.findMany({
      where: { gramPostId: postId, parentId: null, isDeleted: false },
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

  async addComment(postId: number, dto: CreateGramCommentDto, userId: number) {
    const post = await this.getPostById(postId)

    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({ where: { id: dto.parentId } })
      if (!parent || parent.gramPostId !== postId) {
        throw new NotFoundException('Родительский комментарий не найден')
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: sanitizeContent(dto.content),
        authorId: userId,
        gramPostId: postId,
        parentId: dto.parentId,
      },
      include: { author: { select: { id: true, username: true, avatar: true } } },
    })

    // Уведомляем всех в ленте
    this.gateway.emit('gram:feed', 'gram:new_comment', { postId, comment })

    // Уведомление автору поста о комментарии (в фоне — не блокируем ответ)
    const actor = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    })
    this.notifications
      .notify(post.author.id, userId, 'post_comment', {
        actorName: actor?.username ?? '...',
        text: 'прокомментировал ваш пост',
        url: `/gram`,
      })
      .catch(() => {})

    // Если это ответ на комментарий — уведомляем автора родительского
    if (dto.parentId) {
      const parent = await this.prisma.comment.findUnique({
        where: { id: dto.parentId },
        select: { authorId: true },
      })
      if (parent) {
        this.notifications
          .notify(parent.authorId, userId, 'comment_reply', {
            actorName: actor?.username ?? '...',
            text: 'ответил на ваш комментарий',
            url: `/gram`,
          })
          .catch(() => {})
      }
    }

    return comment
  }
}
