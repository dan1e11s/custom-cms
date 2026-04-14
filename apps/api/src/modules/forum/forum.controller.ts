import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import { RevalidationService } from '../../common/revalidation/revalidation.service'
import { CreateForumPostDto } from './dto/create-forum-post.dto'
import { CreateSectionDto } from './dto/create-section.dto'
import { CreateThreadDto } from './dto/create-thread.dto'
import { GetPostsDto } from './dto/get-posts.dto'
import { GetThreadsDto } from './dto/get-threads.dto'
import { PinLockThreadDto } from './dto/pin-lock-thread.dto'
import { UpdateSectionDto } from './dto/update-section.dto'
import { UpdateThreadDto } from './dto/update-thread.dto'
import { ForumService } from './forum.service'

interface AuthUser {
  id: number
  role: string
}

// ─── Публичный форум ─────────────────────────────────────────────────────────

@ApiTags('Forum')
@Controller('forum')
export class ForumPublicController {
  constructor(
    private readonly forumService: ForumService,
    private readonly revalidation: RevalidationService,
  ) {}

  @Public()
  @Get('sections')
  @ApiOperation({ summary: 'Список разделов форума' })
  getSections() {
    return this.forumService.getSections()
  }

  @Public()
  @Get('sections/:slug')
  @ApiOperation({ summary: 'Раздел форума по slug' })
  getSectionBySlug(@Param('slug') slug: string) {
    return this.forumService.getSectionBySlug(slug)
  }

  @Public()
  @Get('sections/:slug/threads')
  @ApiOperation({ summary: 'Темы раздела (с пагинацией)' })
  getThreads(@Param('slug') slug: string, @Query() dto: GetThreadsDto) {
    return this.forumService.getThreads(slug, dto)
  }

  @Public()
  @Get('threads/:slug')
  @ApiOperation({ summary: 'Тема форума по slug (инкремент просмотров)' })
  getThreadBySlug(@Param('slug') slug: string) {
    return this.forumService.getThreadBySlug(slug)
  }

  @Public()
  @Get('threads/:slug/posts')
  @ApiOperation({ summary: 'Сообщения темы (с пагинацией)' })
  getPosts(@Param('slug') slug: string, @Query() dto: GetPostsDto) {
    return this.forumService.getPosts(slug, dto)
  }

  // ── Требуют аутентификации (USER+) ─────────────────────────────────────────

  @ApiBearerAuth()
  @Post('threads')
  @ApiOperation({ summary: 'Создать тему (USER+)' })
  async createThread(@Body() dto: CreateThreadDto, @CurrentUser() user: AuthUser) {
    const result = await this.forumService.createThread(dto, user.id)
    this.revalidation.revalidate('forum').catch(() => {})
    return result
  }

  @ApiBearerAuth()
  @Post('threads/:id/posts')
  @ApiOperation({ summary: 'Ответить в теме (USER+)' })
  addPost(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateForumPostDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.forumService.addPost(id, dto, user.id)
  }

  @ApiBearerAuth()
  @Patch('threads/:id')
  @ApiOperation({ summary: 'Изменить тему (автор или ADMIN)' })
  updateThread(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateThreadDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.forumService.updateThread(id, dto, user.id, user.role)
  }

  @ApiBearerAuth()
  @Delete('threads/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить тему (ADMIN)' })
  async deleteThread(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    const result = await this.forumService.deleteThread(id, user.id, user.role)
    this.revalidation.revalidate('forum').catch(() => {})
    return result
  }

  @ApiBearerAuth()
  @Delete('posts/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить сообщение (автор / ADMIN / MODERATOR)' })
  deletePost(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.forumService.deletePost(id, user.id, user.role)
  }
}

// ─── Административные маршруты ───────────────────────────────────────────────

@ApiTags('Forum Admin')
@Controller('admin/forum')
@ApiBearerAuth()
@Roles(Role.ADMIN)
export class ForumAdminController {
  constructor(
    private readonly forumService: ForumService,
    private readonly revalidation: RevalidationService,
  ) {}

  @Post('sections')
  @ApiOperation({ summary: 'Создать раздел (ADMIN)' })
  async createSection(@Body() dto: CreateSectionDto) {
    const result = await this.forumService.createSection(dto)
    this.revalidation.revalidate('forum').catch(() => {})
    return result
  }

  @Patch('sections/:id')
  @ApiOperation({ summary: 'Изменить раздел (ADMIN)' })
  async updateSection(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSectionDto) {
    const result = await this.forumService.updateSection(id, dto)
    this.revalidation.revalidate('forum').catch(() => {})
    return result
  }

  @Delete('sections/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить раздел (ADMIN)' })
  async deleteSection(@Param('id', ParseIntPipe) id: number) {
    const result = await this.forumService.deleteSection(id)
    this.revalidation.revalidate('forum').catch(() => {})
    return result
  }

  @Patch('threads/:id/pin-lock')
  @ApiOperation({ summary: 'Закрепить / заблокировать тему (ADMIN)' })
  async pinLockThread(@Param('id', ParseIntPipe) id: number, @Body() dto: PinLockThreadDto) {
    const result = await this.forumService.pinLockThread(id, dto)
    this.revalidation.revalidate('forum').catch(() => {})
    return result
  }
}
