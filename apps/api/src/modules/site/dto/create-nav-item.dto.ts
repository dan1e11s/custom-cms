import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, MinLength } from 'class-validator'
import { NavItemType } from '@prisma/client'

export class CreateNavItemDto {
  @IsString()
  @MinLength(1)
  label: string

  @IsEnum(NavItemType)
  @IsOptional()
  type?: NavItemType = NavItemType.PAGE

  @IsString()
  @IsOptional()
  href?: string

  @IsString()
  @IsOptional()
  icon?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsInt()
  @IsOptional()
  order?: number

  @IsInt()
  @IsOptional()
  parentId?: number

  @IsBoolean()
  @IsOptional()
  isVisible?: boolean

  @IsBoolean()
  @IsOptional()
  openInNewTab?: boolean
}
