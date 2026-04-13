import { IsInt, IsOptional, IsString, MaxLength, Min, MinLength } from 'class-validator'

export class UpdateSectionDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  title?: string

  @IsOptional()
  @IsString()
  @MaxLength(100)
  slug?: string

  @IsOptional()
  @IsString()
  @MaxLength(500)
  description?: string

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number
}
