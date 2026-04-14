import { Body, Controller, Get, Param, ParseIntPipe, Patch, Query } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { Roles } from '../../common/decorators/roles.decorator'
import { AdminService } from './admin.service'
import { ChangeRoleDto } from './dto/change-role.dto'
import { SetActiveAdminDto } from './dto/set-active-admin.dto'

@ApiTags('Admin')
@ApiBearerAuth()
@Roles(Role.ADMIN)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ── Дашборд ──────────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Статистика дашборда' })
  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard()
  }

  // ── Пользователи ─────────────────────────────────────────────────────────

  @ApiOperation({ summary: 'Список пользователей' })
  @Get('users')
  getUsers(
    @Query('search') search?: string,
    @Query('role') role?: Role,
    @Query('page', new ParseIntPipe({ optional: true })) page = 1,
    @Query('limit', new ParseIntPipe({ optional: true })) limit = 20,
  ) {
    return this.adminService.getUsers({ search, role, page, limit })
  }

  @ApiOperation({ summary: 'Изменить роль пользователя' })
  @Patch('users/:id/role')
  changeRole(@Param('id', ParseIntPipe) id: number, @Body() dto: ChangeRoleDto) {
    return this.adminService.changeUserRole(id, dto.role)
  }

  @ApiOperation({ summary: 'Заблокировать / разблокировать пользователя' })
  @Patch('users/:id/active')
  setActive(@Param('id', ParseIntPipe) id: number, @Body() dto: SetActiveAdminDto) {
    return this.adminService.setUserActive(id, dto.isActive)
  }
}
