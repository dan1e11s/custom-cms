import { Injectable } from '@nestjs/common'
import { PageStatus, Role } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'

const USER_SELECT = {
  id: true,
  username: true,
  email: true,
  role: true,
  avatar: true,
  isActive: true,
  createdAt: true,
}

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Дашборд ────────────────────────────────────────────────────────────────

  async getDashboard() {
    const now = new Date()
    const fourteenDaysAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000)

    const [
      pagesCount,
      productsCount,
      blogPostsCount,
      usersCount,
      gramPostsCount,
      forumThreadsCount,
      recentPages,
      recentUsers,
      recentBlogPosts,
      recentProducts,
      recentGramPosts,
      chartGramPosts,
      chartUsers,
    ] = await Promise.all([
      this.prisma.page.count({ where: { status: PageStatus.PUBLISHED } }),
      this.prisma.product.count({ where: { status: PageStatus.PUBLISHED } }),
      this.prisma.blogPost.count({ where: { status: PageStatus.PUBLISHED } }),
      this.prisma.user.count({ where: { isActive: true } }),
      this.prisma.gramPost.count({ where: { status: PageStatus.PUBLISHED } }),
      this.prisma.forumThread.count(),

      this.prisma.page.findMany({
        where: { status: PageStatus.PUBLISHED },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { title: true, createdAt: true },
      }),
      this.prisma.user.findMany({
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { username: true, createdAt: true },
      }),
      this.prisma.blogPost.findMany({
        where: { status: PageStatus.PUBLISHED },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { title: true, createdAt: true },
      }),
      this.prisma.product.findMany({
        where: { status: PageStatus.PUBLISHED },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { name: true, createdAt: true },
      }),
      this.prisma.gramPost.findMany({
        where: { status: PageStatus.PUBLISHED },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: { content: true, createdAt: true },
      }),

      this.prisma.gramPost.findMany({
        where: { createdAt: { gte: fourteenDaysAgo } },
        select: { createdAt: true },
      }),
      this.prisma.user.findMany({
        where: { createdAt: { gte: fourteenDaysAgo } },
        select: { createdAt: true },
      }),
    ])

    const activity = [
      ...recentPages.map((p) => ({
        type: 'page' as const,
        label: `Опубликована страница "${p.title}"`,
        createdAt: p.createdAt.toISOString(),
      })),
      ...recentUsers.map((u) => ({
        type: 'user' as const,
        label: `Новый пользователь @${u.username}`,
        createdAt: u.createdAt.toISOString(),
      })),
      ...recentBlogPosts.map((b) => ({
        type: 'blog_post' as const,
        label: `Опубликована статья "${b.title}"`,
        createdAt: b.createdAt.toISOString(),
      })),
      ...recentProducts.map((p) => ({
        type: 'product' as const,
        label: `Добавлен товар "${p.name}"`,
        createdAt: p.createdAt.toISOString(),
      })),
      ...recentGramPosts.map((p) => ({
        type: 'gram_post' as const,
        label: `Новый пост в Граме: ${p.content.slice(0, 40).replace(/<[^>]+>/g, '')}…`,
        createdAt: p.createdAt.toISOString(),
      })),
    ]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)

    const chartData = []
    for (let i = 13; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      const dateStr = date.toISOString().slice(0, 10)
      const label = `${date.getDate().toString().padStart(2, '0')}.${(date.getMonth() + 1).toString().padStart(2, '0')}`

      const posts = chartGramPosts.filter(
        (p) => p.createdAt.toISOString().slice(0, 10) === dateStr,
      ).length
      const users = chartUsers.filter(
        (u) => u.createdAt.toISOString().slice(0, 10) === dateStr,
      ).length

      chartData.push({ date: label, posts, users })
    }

    return {
      stats: {
        pagesCount,
        productsCount,
        blogPostsCount,
        usersCount,
        gramPostsCount,
        forumThreadsCount,
      },
      recentActivity: activity,
      chartData,
    }
  }

  // ── Управление пользователями ──────────────────────────────────────────────

  async getUsers(options: { search?: string; role?: Role; page?: number; limit?: number }) {
    const { search, role, page = 1, limit = 20 } = options

    const where = {
      ...(search
        ? {
            OR: [
              { username: { contains: search, mode: 'insensitive' as const } },
              { email: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
      ...(role ? { role } : {}),
    }

    const [items, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: USER_SELECT,
      }),
      this.prisma.user.count({ where }),
    ])

    return { items, total, page, limit, pages: Math.ceil(total / limit) }
  }

  async changeUserRole(id: number, role: Role) {
    return this.prisma.user.update({
      where: { id },
      data: { role },
      select: USER_SELECT,
    })
  }

  async setUserActive(id: number, isActive: boolean) {
    return this.prisma.user.update({
      where: { id },
      data: { isActive },
      select: USER_SELECT,
    })
  }
}
