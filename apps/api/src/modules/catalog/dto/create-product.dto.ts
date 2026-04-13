import { PageStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsObject,
  IsOptional,
  IsString,
  MaxLength,
  Min,
} from 'class-validator'

export class CreateProductDto {
  @IsString()
  @MaxLength(300)
  name: string

  @IsOptional()
  @IsString()
  @MaxLength(300)
  slug?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  oldPrice?: number

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  images?: string[]

  @IsOptional()
  @IsBoolean()
  inStock?: boolean

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number

  @IsOptional()
  @IsObject()
  attributes?: Record<string, string>

  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus

  @IsOptional()
  @IsString()
  @MaxLength(200)
  seoTitle?: string

  @IsOptional()
  @IsString()
  @MaxLength(400)
  seoDesc?: string
}
