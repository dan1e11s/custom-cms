import { Injectable, NotFoundException } from '@nestjs/common'
import { PrismaService } from '../../prisma/prisma.service'
import { RevalidationService } from '../../common/revalidation/revalidation.service'
import { CreateNavItemDto } from './dto/create-nav-item.dto'
import { UpdateNavItemDto } from './dto/update-nav-item.dto'
import { ReorderNavItemsDto } from './dto/reorder-nav-items.dto'
import { CreateFooterColumnDto } from './dto/create-footer-column.dto'
import { UpdateFooterColumnDto } from './dto/update-footer-column.dto'
import { CreateFooterLinkDto } from './dto/create-footer-link.dto'
import { UpdateFooterLinkDto } from './dto/update-footer-link.dto'
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto'

@Injectable()
export class SiteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly revalidation: RevalidationService,
  ) {}

  // ─── Navigation ──────────────────────────────────────────────────────────────

  async getNavigation(onlyVisible = true) {
    const where = onlyVisible ? { parentId: null, isVisible: true } : { parentId: null }
    return this.prisma.navItem.findMany({
      where,
      orderBy: { order: 'asc' },
      include: {
        children: {
          where: onlyVisible ? { isVisible: true } : undefined,
          orderBy: { order: 'asc' },
        },
      },
    })
  }

  async getAllNavItems() {
    return this.prisma.navItem.findMany({
      where: { parentId: null },
      orderBy: { order: 'asc' },
      include: {
        children: {
          orderBy: { order: 'asc' },
        },
      },
    })
  }

  async createNavItem(dto: CreateNavItemDto) {
    const item = await this.prisma.navItem.create({ data: dto })
    this.revalidation.revalidate('site-navigation').catch(() => {})
    return item
  }

  async updateNavItem(id: number, dto: UpdateNavItemDto) {
    const item = await this.prisma.navItem.findUnique({ where: { id } })
    if (!item) throw new NotFoundException(`NavItem #${id} не найден`)
    const updated = await this.prisma.navItem.update({ where: { id }, data: dto })
    this.revalidation.revalidate('site-navigation').catch(() => {})
    return updated
  }

  async deleteNavItem(id: number) {
    const item = await this.prisma.navItem.findUnique({ where: { id } })
    if (!item) throw new NotFoundException(`NavItem #${id} не найден`)
    // Удалить детей сначала, потом родителя
    await this.prisma.navItem.deleteMany({ where: { parentId: id } })
    await this.prisma.navItem.delete({ where: { id } })
    this.revalidation.revalidate('site-navigation').catch(() => {})
    return { deleted: true }
  }

  async reorderNavItems(dto: ReorderNavItemsDto) {
    await this.prisma.$transaction(
      dto.ids.map((id, index) =>
        this.prisma.navItem.update({ where: { id }, data: { order: index } }),
      ),
    )
    this.revalidation.revalidate('site-navigation').catch(() => {})
    return { reordered: true }
  }

  // ─── Footer ───────────────────────────────────────────────────────────────────

  async getFooter() {
    return this.prisma.footerColumn.findMany({
      orderBy: { order: 'asc' },
      include: {
        links: { orderBy: { order: 'asc' } },
      },
    })
  }

  async createFooterColumn(dto: CreateFooterColumnDto) {
    const column = await this.prisma.footerColumn.create({ data: dto })
    this.revalidation.revalidate('site-footer').catch(() => {})
    return column
  }

  async updateFooterColumn(id: number, dto: UpdateFooterColumnDto) {
    const column = await this.prisma.footerColumn.findUnique({ where: { id } })
    if (!column) throw new NotFoundException(`FooterColumn #${id} не найдена`)
    const updated = await this.prisma.footerColumn.update({ where: { id }, data: dto })
    this.revalidation.revalidate('site-footer').catch(() => {})
    return updated
  }

  async deleteFooterColumn(id: number) {
    const column = await this.prisma.footerColumn.findUnique({ where: { id } })
    if (!column) throw new NotFoundException(`FooterColumn #${id} не найдена`)
    await this.prisma.footerColumn.delete({ where: { id } })
    this.revalidation.revalidate('site-footer').catch(() => {})
    return { deleted: true }
  }

  async createFooterLink(dto: CreateFooterLinkDto) {
    const column = await this.prisma.footerColumn.findUnique({ where: { id: dto.columnId } })
    if (!column) throw new NotFoundException(`FooterColumn #${dto.columnId} не найдена`)
    const link = await this.prisma.footerLink.create({ data: dto })
    this.revalidation.revalidate('site-footer').catch(() => {})
    return link
  }

  async updateFooterLink(id: number, dto: UpdateFooterLinkDto) {
    const link = await this.prisma.footerLink.findUnique({ where: { id } })
    if (!link) throw new NotFoundException(`FooterLink #${id} не найдена`)
    const updated = await this.prisma.footerLink.update({ where: { id }, data: dto })
    this.revalidation.revalidate('site-footer').catch(() => {})
    return updated
  }

  async deleteFooterLink(id: number) {
    const link = await this.prisma.footerLink.findUnique({ where: { id } })
    if (!link) throw new NotFoundException(`FooterLink #${id} не найдена`)
    await this.prisma.footerLink.delete({ where: { id } })
    this.revalidation.revalidate('site-footer').catch(() => {})
    return { deleted: true }
  }

  // ─── Site Settings ────────────────────────────────────────────────────────────

  async getSettings() {
    let settings = await this.prisma.seoSettings.findFirst()
    if (!settings) {
      settings = await this.prisma.seoSettings.create({
        data: { siteName: 'Мой сайт', titleTemplate: '%s | Мой сайт' },
      })
    }
    return settings
  }

  async updateSettings(dto: UpdateSiteSettingsDto) {
    const settings = await this.getSettings()
    const updated = await this.prisma.seoSettings.update({
      where: { id: settings.id },
      data: dto,
    })
    this.revalidation.revalidate('site-settings').catch(() => {})
    return updated
  }
}
