import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Public } from '../../common/decorators/public.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { CreatePageDto } from './dto/create-page.dto'
import { ListPagesDto } from './dto/list-pages.dto'
import { UpdateBlocksDto, UpdatePageDto, UpdatePageSeoDto } from './dto/update-page.dto'
import { PagesService } from './pages.service'

// ── Публичные эндпоинты ──────────────────────────────────────────────────────

@ApiTags('Pages (Public)')
@Controller('pages')
export class PagesPublicController {
  constructor(private readonly pagesService: PagesService) {}

  @ApiOperation({ summary: 'Список опубликованных страниц' })
  @Public()
  @Get()
  findPublished(@Query() dto: ListPagesDto) {
    return this.pagesService.findPublished(dto)
  }

  @ApiOperation({ summary: 'Получить главную страницу (isHomePage=true, PUBLISHED)' })
  @Public()
  @Get('home')
  findHomePage() {
    return this.pagesService.findHomePage()
  }

  @ApiOperation({ summary: 'Получить страницу по slug' })
  @Public()
  @Get(':slug')
  findBySlug(@Param('slug') slug: string) {
    return this.pagesService.findBySlug(slug)
  }
}

// ── Admin эндпоинты ──────────────────────────────────────────────────────────

@ApiTags('Pages (Admin)')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin/pages')
export class PagesAdminController {
  constructor(private readonly pagesService: PagesService) {}

  @ApiOperation({ summary: 'Список всех страниц (все статусы)' })
  @Get()
  findAll(@Query() dto: ListPagesDto) {
    return this.pagesService.findAll(dto)
  }

  @ApiOperation({ summary: 'Получить страницу по id' })
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.findById(id)
  }

  @ApiOperation({ summary: 'Создать страницу' })
  @Post()
  create(@Body() dto: CreatePageDto, @CurrentUser() user: { id: number }) {
    return this.pagesService.create(dto, user.id)
  }

  @ApiOperation({ summary: 'Обновить страницу' })
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePageDto) {
    return this.pagesService.update(id, dto)
  }

  @ApiOperation({ summary: 'Обновить блоки страницы' })
  @Patch(':id/blocks')
  updateBlocks(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateBlocksDto) {
    return this.pagesService.updateBlocks(id, dto)
  }

  @ApiOperation({ summary: 'Опубликовать страницу' })
  @Patch(':id/publish')
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.publish(id)
  }

  @ApiOperation({ summary: 'Снять с публикации (→ DRAFT)' })
  @Patch(':id/unpublish')
  unpublish(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.unpublish(id)
  }

  @ApiOperation({ summary: 'Архивировать страницу' })
  @Patch(':id/archive')
  archive(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.archive(id)
  }

  @ApiOperation({ summary: 'Обновить SEO страницы' })
  @Patch(':id/seo')
  updateSeo(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePageSeoDto) {
    return this.pagesService.updateSeo(id, dto)
  }

  @ApiOperation({ summary: 'Дублировать страницу' })
  @Post(':id/duplicate')
  duplicate(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: { id: number }) {
    return this.pagesService.duplicate(id, user.id)
  }

  @ApiOperation({ summary: 'Сделать страницу главной (isHomePage=true)' })
  @Patch(':id/set-home')
  setAsHomePage(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.setAsHomePage(id)
  }

  @ApiOperation({ summary: 'Удалить страницу' })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.pagesService.remove(id)
  }
}
