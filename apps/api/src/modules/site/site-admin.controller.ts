import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard'
import { RolesGuard } from '../../common/guards/roles.guard'
import { Roles } from '../../common/decorators/roles.decorator'
import { SiteService } from './site.service'
import { CreateNavItemDto } from './dto/create-nav-item.dto'
import { UpdateNavItemDto } from './dto/update-nav-item.dto'
import { ReorderNavItemsDto } from './dto/reorder-nav-items.dto'
import { CreateFooterColumnDto } from './dto/create-footer-column.dto'
import { UpdateFooterColumnDto } from './dto/update-footer-column.dto'
import { CreateFooterLinkDto } from './dto/create-footer-link.dto'
import { UpdateFooterLinkDto } from './dto/update-footer-link.dto'
import { UpdateSiteSettingsDto } from './dto/update-site-settings.dto'

@ApiTags('admin/site')
@Controller('admin/site')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class SiteAdminController {
  constructor(private readonly siteService: SiteService) {}

  // ─── Navigation ──────────────────────────────────────────────────────────────

  @Get('navigation')
  @ApiOperation({ summary: 'Получить всю навигацию (включая скрытые пункты)' })
  getAllNavItems() {
    return this.siteService.getAllNavItems()
  }

  @Post('navigation')
  @ApiOperation({ summary: 'Создать пункт навигации' })
  createNavItem(@Body() dto: CreateNavItemDto) {
    return this.siteService.createNavItem(dto)
  }

  @Patch('navigation/reorder')
  @ApiOperation({ summary: 'Переупорядочить пункты навигации' })
  reorderNavItems(@Body() dto: ReorderNavItemsDto) {
    return this.siteService.reorderNavItems(dto)
  }

  @Patch('navigation/:id')
  @ApiOperation({ summary: 'Обновить пункт навигации' })
  updateNavItem(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateNavItemDto) {
    return this.siteService.updateNavItem(id, dto)
  }

  @Delete('navigation/:id')
  @ApiOperation({ summary: 'Удалить пункт навигации (и его детей)' })
  deleteNavItem(@Param('id', ParseIntPipe) id: number) {
    return this.siteService.deleteNavItem(id)
  }

  // ─── Footer ───────────────────────────────────────────────────────────────────

  @Get('footer/columns')
  @ApiOperation({ summary: 'Получить все колонки футера с ссылками' })
  getFooter() {
    return this.siteService.getFooter()
  }

  @Post('footer/columns')
  @ApiOperation({ summary: 'Создать колонку футера' })
  createFooterColumn(@Body() dto: CreateFooterColumnDto) {
    return this.siteService.createFooterColumn(dto)
  }

  @Patch('footer/columns/:id')
  @ApiOperation({ summary: 'Обновить колонку футера' })
  updateFooterColumn(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFooterColumnDto) {
    return this.siteService.updateFooterColumn(id, dto)
  }

  @Delete('footer/columns/:id')
  @ApiOperation({ summary: 'Удалить колонку футера (со всеми ссылками)' })
  deleteFooterColumn(@Param('id', ParseIntPipe) id: number) {
    return this.siteService.deleteFooterColumn(id)
  }

  @Post('footer/links')
  @ApiOperation({ summary: 'Добавить ссылку в колонку футера' })
  createFooterLink(@Body() dto: CreateFooterLinkDto) {
    return this.siteService.createFooterLink(dto)
  }

  @Patch('footer/links/:id')
  @ApiOperation({ summary: 'Обновить ссылку футера' })
  updateFooterLink(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateFooterLinkDto) {
    return this.siteService.updateFooterLink(id, dto)
  }

  @Delete('footer/links/:id')
  @ApiOperation({ summary: 'Удалить ссылку футера' })
  deleteFooterLink(@Param('id', ParseIntPipe) id: number) {
    return this.siteService.deleteFooterLink(id)
  }

  // ─── Settings ─────────────────────────────────────────────────────────────────

  @Get('settings')
  @ApiOperation({ summary: 'Получить настройки сайта' })
  getSettings() {
    return this.siteService.getSettings()
  }

  @Patch('settings')
  @ApiOperation({ summary: 'Обновить настройки сайта' })
  updateSettings(@Body() dto: UpdateSiteSettingsDto) {
    return this.siteService.updateSettings(dto)
  }
}
