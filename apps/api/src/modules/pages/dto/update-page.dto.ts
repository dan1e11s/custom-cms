import { ApiPropertyOptional, PartialType } from '@nestjs/swagger'
import { IsArray, IsOptional } from 'class-validator'
import { CreatePageDto } from './create-page.dto'

export class UpdatePageDto extends PartialType(CreatePageDto) {}

export class UpdateBlocksDto {
  @ApiPropertyOptional({ type: 'array', description: 'Обновлённый массив блоков' })
  @IsArray()
  blocks: object[]
}

export class UpdatePageSeoDto {
  @ApiPropertyOptional()
  @IsOptional()
  metaTitle?: string

  @ApiPropertyOptional()
  @IsOptional()
  metaDesc?: string

  @ApiPropertyOptional()
  @IsOptional()
  h1?: string

  @ApiPropertyOptional()
  @IsOptional()
  canonical?: string

  @ApiPropertyOptional()
  @IsOptional()
  ogTitle?: string

  @ApiPropertyOptional()
  @IsOptional()
  ogDesc?: string

  @ApiPropertyOptional()
  @IsOptional()
  ogImage?: string

  @ApiPropertyOptional()
  @IsOptional()
  noindex?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  schemaType?: string

  @ApiPropertyOptional()
  @IsOptional()
  schemaData?: object
}
