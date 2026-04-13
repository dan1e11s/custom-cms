import { Type } from 'class-transformer'
import {
  IsIn,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator'

export class FilterPostsDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  search?: string

  @IsOptional()
  @IsString()
  categorySlug?: string

  @IsOptional()
  @IsString()
  tag?: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  page?: number = 1

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 10

  @IsOptional()
  @IsIn(['createdAt', 'publishedAt', 'views'])
  sortBy?: 'createdAt' | 'publishedAt' | 'views' = 'publishedAt'

  @IsOptional()
  @IsIn(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc'
}
