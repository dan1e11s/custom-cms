import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { memoryStorage } from 'multer'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
import { ChangePasswordDto } from './dto/change-password.dto'
import { SetActiveDto, UpdateProfileDto } from './dto/update-profile.dto'
import { UsersService } from './users.service'

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Профиль текущего пользователя' })
  @Get('me')
  getMe(@CurrentUser() user: { id: number }) {
    return this.usersService.findById(user.id)
  }

  @ApiOperation({ summary: 'Обновить профиль текущего пользователя' })
  @Patch('me')
  updateMe(@CurrentUser() user: { id: number }, @Body() dto: UpdateProfileDto) {
    return this.usersService.updateProfile(user.id, dto)
  }

  @ApiOperation({ summary: 'Загрузить аватар' })
  @ApiConsumes('multipart/form-data')
  @Post('me/avatar')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  uploadAvatar(@UploadedFile() file: Express.Multer.File, @CurrentUser() user: { id: number }) {
    return this.usersService.uploadAvatar(user.id, file)
  }

  @ApiOperation({ summary: 'Сменить пароль' })
  @Patch('me/password')
  changePassword(@CurrentUser() user: { id: number }, @Body() dto: ChangePasswordDto) {
    return this.usersService.changePassword(user.id, dto)
  }

  @ApiOperation({ summary: 'Мои посты в Граме' })
  @Get('me/posts')
  getMyPosts(@CurrentUser() user: { id: number }) {
    return this.usersService.getMyGramPosts(user.id)
  }

  @ApiOperation({ summary: 'Мои комментарии' })
  @Get('me/comments')
  getMyComments(@CurrentUser() user: { id: number }) {
    return this.usersService.getMyComments(user.id)
  }

  @ApiOperation({ summary: 'Моя активность на форуме' })
  @Get('me/forum')
  getMyForum(@CurrentUser() user: { id: number }) {
    return this.usersService.getMyForumActivity(user.id)
  }

  @ApiOperation({ summary: 'Получить пользователя по id (ADMIN)' })
  @Roles(Role.ADMIN)
  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.usersService.findById(id)
  }

  @ApiOperation({ summary: 'Активировать / деактивировать пользователя (ADMIN)' })
  @Roles(Role.ADMIN)
  @Patch(':id/active')
  setActive(@Param('id', ParseIntPipe) id: number, @Body() dto: SetActiveDto) {
    return this.usersService.setActive(id, dto.isActive)
  }
}
