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
  constructor(private readonly forumService: ForumService) {}

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
  createThread(@Body() dto: CreateThreadDto, @CurrentUser() user: AuthUser) {
    return this.forumService.createThread(dto, user.id)
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
  deleteThread(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.forumService.deleteThread(id, user.id, user.role)
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
  constructor(private readonly forumService: ForumService) {}

  @Post('sections')
  @ApiOperation({ summary: 'Создать раздел (ADMIN)' })
  createSection(@Body() dto: CreateSectionDto) {
    return this.forumService.createSection(dto)
  }

  @Patch('sections/:id')
  @ApiOperation({ summary: 'Изменить раздел (ADMIN)' })
  updateSection(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateSectionDto) {
    return this.forumService.updateSection(id, dto)
  }

  @Delete('sections/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить раздел (ADMIN)' })
  deleteSection(@Param('id', ParseIntPipe) id: number) {
    return this.forumService.deleteSection(id)
  }

  @Patch('threads/:id/pin-lock')
  @ApiOperation({ summary: 'Закрепить / заблокировать тему (ADMIN)' })
  pinLockThread(@Param('id', ParseIntPipe) id: number, @Body() dto: PinLockThreadDto) {
    return this.forumService.pinLockThread(id, dto)
  }
}
