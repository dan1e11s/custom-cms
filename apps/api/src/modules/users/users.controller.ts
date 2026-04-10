import { Body, Controller, Get, Param, ParseIntPipe, Patch } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { Roles } from '../../common/decorators/roles.decorator'
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
