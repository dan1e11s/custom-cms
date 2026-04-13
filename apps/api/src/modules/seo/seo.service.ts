import { ConflictException, Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { CreateRedirectDto, UpdateRedirectDto } from './dto/redirect.dto'
import { UpdateSeoSettingsDto } from './dto/seo-settings.dto'

const SETTINGS_ID = 1

@Injectable()
export class SeoService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Глобальные настройки ──────────────────────────────────────────────────

  async getSettings() {
    return this.prisma.seoSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID },
      update: {},
    })
  }

  async updateSettings(dto: UpdateSeoSettingsDto) {
    return this.prisma.seoSettings.upsert({
      where: { id: SETTINGS_ID },
      create: { id: SETTINGS_ID, ...dto },
      update: dto,
    })
  }

  // ── Редиректы ─────────────────────────────────────────────────────────────

  async getRedirects() {
    return this.prisma.redirect.findMany({
      orderBy: { createdAt: 'desc' },
    })
  }

  async createRedirect(dto: CreateRedirectDto) {
    const existing = await this.prisma.redirect.findUnique({
      where: { from: dto.from },
    })
    if (existing) {
      throw new ConflictException(`Редирект с путём "${dto.from}" уже существует`)
    }

    return this.prisma.redirect.create({
      data: {
        from: dto.from,
        to: dto.to,
        statusCode: dto.statusCode ?? 301,
      },
    })
  }

  async updateRedirect(id: number, dto: UpdateRedirectDto) {
    await this.findRedirectById(id)
    return this.prisma.redirect.update({ where: { id }, data: dto })
  }

  async deleteRedirect(id: number) {
    await this.findRedirectById(id)
    await this.prisma.redirect.delete({ where: { id } })
    return { success: true }
  }

  // ── Активные редиректы для middleware ────────────────────────────────────

  async getActiveRedirects() {
    return this.prisma.redirect.findMany({
      where: { isActive: true },
      select: { from: true, to: true, statusCode: true },
    })
  }

  // ── Приватные утилиты ─────────────────────────────────────────────────────

  private async findRedirectById(id: number) {
    const redirect = await this.prisma.redirect.findUnique({ where: { id } })
    if (!redirect) throw new NotFoundException(`Редирект #${id} не найден`)
    return redirect
  }
}
