import { ApiPropertyOptional } from '@nestjs/swagger'
import { PageStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator'

export class ListPagesDto {
  @ApiPropertyOptional({ enum: PageStatus })
  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus

  @ApiPropertyOptional({ description: 'Поиск по title или slug' })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20
}
