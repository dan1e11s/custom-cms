import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { PageStatus } from '@prisma/client'
import { PrismaService } from '../../prisma/prisma.service'
import { CreatePageDto } from './dto/create-page.dto'
import { ListPagesDto } from './dto/list-pages.dto'
import { UpdateBlocksDto, UpdatePageDto, UpdatePageSeoDto } from './dto/update-page.dto'
import { generateSlug } from './pages.utils'

const PAGE_INCLUDE = {
  seo: true,
  author: {
    select: { id: true, username: true, avatar: true },
  },
}

@Injectable()
export class PagesService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Список страниц (публичный: только PUBLISHED) ──────────────────────────

  async findPublished(dto: ListPagesDto) {
    return this.findAll({ ...dto, status: PageStatus.PUBLISHED })
  }

  // ── Список страниц (ADMIN: все статусы) ───────────────────────────────────

  async findAll(dto: ListPagesDto) {
    const { status, search, page = 1, limit = 20 } = dto
    const skip = (page - 1) * limit

    const where = {
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { title: { contains: search, mode: 'insensitive' as const } },
              { slug: { contains: search, mode: 'insensitive' as const } },
            ],
          }
        : {}),
    }

    const [items, total] = await this.prisma.$transaction([
      this.prisma.page.findMany({
        where,
        include: PAGE_INCLUDE,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.page.count({ where }),
    ])

    return { items, total, page, limit, pages: Math.ceil(total / limit) }
  }

  // ── Получить опубликованную страницу по slug (публичный) ──────────────────

  async findBySlug(slug: string) {
    const page = await this.prisma.page.findFirst({
      where: { slug, status: PageStatus.PUBLISHED },
      include: PAGE_INCLUDE,
    })
    if (!page) throw new NotFoundException(`Страница "${slug}" не найдена`)
    return page
  }

  // ── Получить страницу по id (ADMIN) ───────────────────────────────────────

  async findById(id: number) {
    const page = await this.prisma.page.findUnique({
      where: { id },
      include: PAGE_INCLUDE,
    })
    if (!page) throw new NotFoundException(`Страница #${id} не найдена`)
    return page
  }

  // ── Создание страницы ─────────────────────────────────────────────────────

  async create(dto: CreatePageDto, userId: number) {
    const slug = dto.slug || generateSlug(dto.title)
    await this.ensureSlugUnique(slug)

    return this.prisma.page.create({
      data: {
        title: dto.title,
        slug,
        status: dto.status ?? PageStatus.DRAFT,
        template: dto.template ?? 'landing',
        blocks: dto.blocks ?? [],
        authorId: userId,
        seo: { create: {} },
      },
      include: PAGE_INCLUDE,
    })
  }

  // ── Обновление страницы ───────────────────────────────────────────────────

  async update(id: number, dto: UpdatePageDto) {
    await this.findById(id)

    if (dto.slug) {
      await this.ensureSlugUnique(dto.slug, id)
    }

    return this.prisma.page.update({
      where: { id },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.slug !== undefined && { slug: dto.slug }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.template !== undefined && { template: dto.template }),
        ...(dto.blocks !== undefined && { blocks: dto.blocks }),
      },
      include: PAGE_INCLUDE,
    })
  }

  // ── Обновить только блоки (patch) ─────────────────────────────────────────

  async updateBlocks(id: number, dto: UpdateBlocksDto) {
    await this.findById(id)

    return this.prisma.page.update({
      where: { id },
      data: { blocks: dto.blocks, updatedAt: new Date() },
      include: PAGE_INCLUDE,
    })
  }

  // ── Публикация ────────────────────────────────────────────────────────────

  async publish(id: number) {
    await this.findById(id)

    const page = await this.prisma.page.update({
      where: { id },
      data: { status: PageStatus.PUBLISHED },
      include: PAGE_INCLUDE,
    })

    // ISR-инвалидация — уведомляем Next.js перегенерировать страницу
    this.triggerRevalidate(page.slug).catch(() => {
      // не блокируем ответ, если фронт недоступен
    })

    return page
  }

  // ── Снять с публикации (→ DRAFT) ──────────────────────────────────────────

  async unpublish(id: number) {
    await this.findById(id)

    return this.prisma.page.update({
      where: { id },
      data: { status: PageStatus.DRAFT },
      include: PAGE_INCLUDE,
    })
  }

  // ── Архивировать ─────────────────────────────────────────────────────────

  async archive(id: number) {
    await this.findById(id)

    return this.prisma.page.update({
      where: { id },
      data: { status: PageStatus.ARCHIVED },
      include: PAGE_INCLUDE,
    })
  }

  // ── Дублировать ───────────────────────────────────────────────────────────

  async duplicate(id: number, userId: number) {
    const source = await this.findById(id)

    const newSlug = `${source.slug}-copy-${Date.now()}`

    return this.prisma.page.create({
      data: {
        title: `${source.title} (копия)`,
        slug: newSlug,
        status: PageStatus.DRAFT,
        template: source.template,
        blocks: source.blocks as object[],
        authorId: userId,
        seo: { create: {} },
      },
      include: PAGE_INCLUDE,
    })
  }

  // ── Обновить SEO ──────────────────────────────────────────────────────────

  async updateSeo(id: number, dto: UpdatePageSeoDto) {
    await this.findById(id)

    return this.prisma.pageSeo.upsert({
      where: { pageId: id },
      create: { pageId: id, ...dto },
      update: dto,
    })
  }

  // ── Удалить ───────────────────────────────────────────────────────────────

  async remove(id: number) {
    await this.findById(id)
    await this.prisma.page.delete({ where: { id } })
    return { success: true }
  }

  // ── Приватные утилиты ─────────────────────────────────────────────────────

  private async ensureSlugUnique(slug: string, excludeId?: number) {
    const existing = await this.prisma.page.findFirst({
      where: {
        slug,
        ...(excludeId ? { NOT: { id: excludeId } } : {}),
      },
    })
    if (existing) {
      throw new ConflictException(`Slug "${slug}" уже занят`)
    }
  }

  private async triggerRevalidate(slug: string) {
    const frontendUrl = process.env.FRONTEND_URL
    const secret = process.env.REVALIDATE_SECRET
    if (!frontendUrl || !secret) return

    await fetch(`${frontendUrl}/api/revalidate?tag=page-${slug}`, {
      method: 'POST',
      headers: { 'x-revalidate-secret': secret },
    })
  }
}
