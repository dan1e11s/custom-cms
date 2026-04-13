import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Public } from '../../common/decorators/public.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { BlogService } from './blog.service'
import { CreateCommentDto } from './dto/create-comment.dto'
import { CreatePostDto } from './dto/create-post.dto'
import { FilterPostsDto } from './dto/filter-posts.dto'
import { SchedulePublishDto } from './dto/schedule-publish.dto'
import { UpdatePostDto } from './dto/update-post.dto'

// ── Публичные эндпоинты ───────────────────────────────────────────────────────

@ApiTags('Blog (Public)')
@Controller('blog')
export class BlogPublicController {
  constructor(private readonly blogService: BlogService) {}

  @Public()
  @Get('posts')
  @ApiOperation({ summary: 'Список опубликованных статей (с фильтрацией)' })
  findPublished(@Query() dto: FilterPostsDto) {
    return this.blogService.findPublished(dto)
  }

  @Public()
  @Get('posts/:slug')
  @ApiOperation({ summary: 'Статья по slug (инкремент просмотров)' })
  findBySlug(@Param('slug') slug: string, @Headers('user-agent') userAgent?: string) {
    return this.blogService.findBySlug(slug, userAgent)
  }

  @Public()
  @Get('posts/:slug/comments')
  @ApiOperation({ summary: 'Комментарии к статье' })
  getComments(@Param('slug') slug: string) {
    return this.blogService.getComments(slug)
  }

  @Post('posts/:slug/comments')
  @ApiOperation({ summary: 'Добавить комментарий (USER+, требует JWT)' })
  addComment(
    @Param('slug') slug: string,
    @Body() dto: CreateCommentDto,
    @CurrentUser() user: { id: number },
  ) {
    return this.blogService.addComment(slug, dto, user.id)
  }

  @Public()
  @Get('tags')
  @ApiOperation({ summary: 'Все теги блога' })
  getTags() {
    return this.blogService.getTags()
  }

  @Public()
  @Get('categories')
  @ApiOperation({ summary: 'Категории блога' })
  getBlogCategories() {
    return this.blogService.getBlogCategories()
  }
}

// ── Admin эндпоинты ───────────────────────────────────────────────────────────

@ApiTags('Blog (Admin)')
@ApiBearerAuth()
@Roles('ADMIN')
@Controller('admin/blog')
export class BlogAdminController {
  constructor(private readonly blogService: BlogService) {}

  @Get('posts')
  @ApiOperation({ summary: 'Все статьи (все статусы)' })
  findAll(@Query() dto: FilterPostsDto) {
    return this.blogService.findAll(dto)
  }

  @Get('posts/:id')
  @ApiOperation({ summary: 'Статья по ID' })
  findById(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.findById(id)
  }

  @Post('posts')
  @ApiOperation({ summary: 'Создать статью' })
  create(@Body() dto: CreatePostDto, @CurrentUser() user: { id: number }) {
    return this.blogService.create(dto, user.id)
  }

  @Patch('posts/:id')
  @ApiOperation({ summary: 'Обновить статью' })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdatePostDto) {
    return this.blogService.update(id, dto)
  }

  @Patch('posts/:id/publish')
  @ApiOperation({ summary: 'Опубликовать немедленно' })
  publish(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.publish(id)
  }

  @Patch('posts/:id/unpublish')
  @ApiOperation({ summary: 'Снять с публикации' })
  unpublish(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.unpublish(id)
  }

  @Patch('posts/:id/schedule')
  @ApiOperation({ summary: 'Запланировать публикацию (publishAt — ISO дата)' })
  schedule(@Param('id', ParseIntPipe) id: number, @Body() dto: SchedulePublishDto) {
    return this.blogService.schedulePublish(id, new Date(dto.publishAt))
  }

  @Delete('posts/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить статью' })
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.blogService.remove(id)
  }
}
