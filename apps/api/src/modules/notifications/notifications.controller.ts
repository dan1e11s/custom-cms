import {
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Query,
} from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { CurrentUser } from '../../common/decorators/current-user.decorator'
import { NotificationsService } from './notifications.service'

interface AuthUser {
  id: number
  role: string
}

@ApiTags('Notifications')
@Controller('notifications')
@ApiBearerAuth()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Мои уведомления' })
  getMyNotifications(@CurrentUser() user: AuthUser, @Query('limit') limit?: string) {
    return this.notificationsService.getMyNotifications(user.id, limit ? Number(limit) : 30)
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Количество непрочитанных' })
  getUnreadCount(@CurrentUser() user: AuthUser) {
    return this.notificationsService.getUnreadCount(user.id)
  }

  @Patch('read-all')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отметить все как прочитанные' })
  markAllRead(@CurrentUser() user: AuthUser) {
    return this.notificationsService.markAllRead(user.id)
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Отметить уведомление как прочитанное' })
  markRead(@Param('id', ParseIntPipe) id: number, @CurrentUser() user: AuthUser) {
    return this.notificationsService.markRead(id, user.id)
  }

  @Delete()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Удалить все уведомления' })
  deleteAll(@CurrentUser() user: AuthUser) {
    return this.notificationsService.deleteAll(user.id)
  }
}
