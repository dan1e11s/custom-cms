import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsString, MaxLength } from 'class-validator'

export class CreateCategoryDto {
  @IsString()
  @MaxLength(200)
  name: string

  @IsOptional()
  @IsString()
  @MaxLength(200)
  slug?: string

  @IsOptional()
  @IsString()
  description?: string

  @IsOptional()
  @IsString()
  image?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  parentId?: number

  @IsOptional()
  @IsString()
  @MaxLength(200)
  seoTitle?: string

  @IsOptional()
  @IsString()
  @MaxLength(400)
  seoDesc?: string
}
