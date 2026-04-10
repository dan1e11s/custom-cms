import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateMediaDto {
  @ApiPropertyOptional({ example: 'Фото главного баннера' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  alt?: string
}
