import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean } from 'class-validator'

export class SetActiveAdminDto {
  @ApiProperty()
  @IsBoolean()
  isActive: boolean
}
