import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { PageStatus } from '@prisma/client'
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator'

export class CreatePageDto {
  @ApiProperty({ example: 'Моя страница' })
  @IsString()
  @MinLength(1)
  @MaxLength(255)
  title: string

  @ApiPropertyOptional({ example: 'moya-stranica' })
  @IsOptional()
  @IsString()
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug должен содержать только строчные латинские буквы, цифры и дефисы',
  })
  @MaxLength(255)
  slug?: string

  @ApiPropertyOptional({ enum: PageStatus, default: PageStatus.DRAFT })
  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus

  @ApiPropertyOptional({ default: 'landing' })
  @IsOptional()
  @IsString()
  template?: string

  @ApiPropertyOptional({ type: 'array', description: 'Массив конфигураций блоков' })
  @IsOptional()
  @IsArray()
  blocks?: object[]
}
