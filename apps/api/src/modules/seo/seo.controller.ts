import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
} from '@nestjs/common'
import { ApiOperation, ApiTags } from '@nestjs/swagger'
import { Roles } from '../../common/decorators/roles.decorator'
import { Public } from '../../common/decorators/public.decorator'
import { CreateRedirectDto, UpdateRedirectDto } from './dto/redirect.dto'
import { UpdateSeoSettingsDto } from './dto/seo-settings.dto'
import { SeoService } from './seo.service'
import { SitemapService } from './sitemap.service'

// ── Публичные эндпоинты ───────────────────────────────────────────────────────

@ApiTags('SEO (Public)')
@Controller('seo')
export class SeoPublicController {
  constructor(
    private readonly seoService: SeoService,
    private readonly sitemapService: SitemapService,
  ) {}

  @Public()
  @Get('settings')
  @ApiOperation({ summary: 'Глобальные SEO-настройки сайта' })
  getSettings() {
    return this.seoService.getSettings()
  }

  @Public()
  @Get('sitemap-data')
  @ApiOperation({ summary: 'Данные для Next.js sitemap.ts' })
  getSitemapData() {
    return this.sitemapService.getSitemapData()
  }

  @Public()
  @Get('sitemap.xml')
  @Header('Content-Type', 'application/xml')
  @ApiOperation({ summary: 'Sitemap XML (кэшируется)' })
  getSitemapXml() {
    return this.sitemapService.getXml()
  }

  @Public()
  @Get('redirects/active')
  @ApiOperation({ summary: 'Активные редиректы' })
  getActiveRedirects() {
    return this.seoService.getActiveRedirects()
  }
}

// ── Admin эндпоинты ───────────────────────────────────────────────────────────

@ApiTags('SEO (Admin)')
@Roles('ADMIN')
@Controller('admin/seo')
export class SeoAdminController {
  constructor(
    private readonly seoService: SeoService,
    private readonly sitemapService: SitemapService,
  ) {}

  @Patch('settings')
  @ApiOperation({ summary: 'Обновить глобальные SEO-настройки' })
  updateSettings(@Body() dto: UpdateSeoSettingsDto) {
    return this.seoService.updateSettings(dto)
  }

  @Get('redirects')
  @ApiOperation({ summary: 'Список всех редиректов' })
  getRedirects() {
    return this.seoService.getRedirects()
  }

  @Post('redirects')
  @ApiOperation({ summary: 'Создать редирект' })
  createRedirect(@Body() dto: CreateRedirectDto) {
    return this.seoService.createRedirect(dto)
  }

  @Patch('redirects/:id')
  @ApiOperation({ summary: 'Обновить редирект (активность, цель, код)' })
  updateRedirect(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRedirectDto) {
    return this.seoService.updateRedirect(id, dto)
  }

  @Delete('redirects/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить редирект' })
  deleteRedirect(@Param('id', ParseIntPipe) id: number) {
    return this.seoService.deleteRedirect(id)
  }

  @Post('sitemap/rebuild')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Принудительно пересобрать sitemap' })
  async rebuildSitemap() {
    await this.sitemapService.rebuild()
    return { success: true, message: 'Sitemap успешно пересобран' }
  }
}
