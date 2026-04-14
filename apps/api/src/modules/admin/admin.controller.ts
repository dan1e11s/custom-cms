import { Controller, Get } from '@nestjs/common'
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger'
import { Role } from '@prisma/client'
import { Roles } from '../../common/decorators/roles.decorator'
import { AdminService } from './admin.service'

@ApiTags('Admin')
@ApiBearerAuth()
@Roles(Role.ADMIN, Role.MODERATOR)
@Controller('admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: 'Статистика дашборда' })
  @Get('dashboard')
  getDashboard() {
    return this.adminService.getDashboard()
  }
}
