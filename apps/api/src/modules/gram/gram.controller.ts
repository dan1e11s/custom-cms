import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Request,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Public } from '../../common/decorators/public.decorator'
import { CreateGramCommentDto } from './dto/create-gram-comment.dto'
import { CreateGramPostDto } from './dto/create-gram-post.dto'
import { GetFeedDto } from './dto/get-feed.dto'
import { GramService } from './gram.service'

interface AuthUser {
  id: number
  role: string
}

@ApiTags('Gram')
@Controller('gram')
export class GramController {
  constructor(private readonly gramService: GramService) {}

  // ── Публичные ─────────────────────────────────────────────────────────────

  @Public()
  @Get('posts')
  @ApiOperation({ summary: 'Лента постов (cursor-based пагинация)' })
  getFeed(@Query() dto: GetFeedDto) {
    return this.gramService.getFeed(dto)
  }

  @Public()
  @Get('posts/:id')
  @ApiOperation({ summary: 'Пост по ID' })
  getPostById(@Param('id', ParseIntPipe) id: number) {
    return this.gramService.getPostById(id)
  }

  @Public()
  @Get('posts/:id/comments')
  @ApiOperation({ summary: 'Комментарии к посту' })
  getComments(@Param('id', ParseIntPipe) id: number) {
    return this.gramService.getComments(id)
  }

  @Public()
  @Get('tags/:tag')
  @ApiOperation({ summary: 'Посты по хэштегу' })
  getPostsByTag(@Param('tag') tag: string) {
    return this.gramService.getPostsByTag(tag)
  }

  @Public()
  @Get('users/:userId/posts')
  @ApiOperation({ summary: 'Посты конкретного пользователя' })
  getUserPosts(@Param('userId', ParseIntPipe) userId: number) {
    return this.gramService.getUserPosts(userId)
  }

  // ── Требуют аутентификации ─────────────────────────────────────────────────

  @ApiBearerAuth()
  @Post('posts')
  @ApiOperation({ summary: 'Создать пост (USER+)' })
  createPost(@Body() dto: CreateGramPostDto, @CurrentUser() user: AuthUser) {
    return this.gramService.createPost(dto, user.id)
  }

  @ApiBearerAuth()
  @Delete('posts/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить пост (свой или ADMIN/MODERATOR)' })
  deletePost(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.gramService.deletePost(id, user.id, user.role)
  }

  @ApiBearerAuth()
  @Post('posts/:id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Поставить / убрать лайк (toggle)' })
  toggleLike(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.gramService.toggleLike(id, user.id)
  }

  @ApiBearerAuth()
  @Delete('posts/:id/like')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Убрать лайк (явный DELETE)' })
  unlike(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.gramService.toggleLike(id, user.id)
  }

  @ApiBearerAuth()
  @Get('posts/:id/like')
  @ApiOperation({ summary: 'Статус лайка текущего пользователя' })
  getLikeStatus(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.gramService.getLikeStatus(id, user.id)
  }

  @ApiBearerAuth()
  @Post('posts/:id/comments')
  @ApiOperation({ summary: 'Добавить комментарий (USER+)' })
  addComment(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: CreateGramCommentDto,
    @CurrentUser() user: AuthUser,
  ) {
    return this.gramService.addComment(id, dto, user.id)
  }
}
