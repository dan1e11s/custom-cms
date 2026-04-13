import { PageStatus } from '@prisma/client'
import { Type } from 'class-transformer'
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator'

export class CreatePostDto {
  @IsString()
  @MaxLength(300)
  title: string

  @IsOptional()
  @IsString()
  @MaxLength(300)
  slug?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  excerpt?: string

  @IsString()
  content: string

  @IsOptional()
  @IsString()
  coverImage?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  categoryId?: number

  /** Слаги тегов — создаются/находятся автоматически */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[]

  @IsOptional()
  @IsEnum(PageStatus)
  status?: PageStatus

  /** ISO-дата для плановой публикации */
  @IsOptional()
  @IsDateString()
  publishedAt?: string

  @IsOptional()
  @IsString()
  @MaxLength(200)
  seoTitle?: string

  @IsOptional()
  @IsString()
  @MaxLength(400)
  seoDesc?: string
}
