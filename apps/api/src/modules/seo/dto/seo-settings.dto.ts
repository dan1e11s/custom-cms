import { IsOptional, IsString, MaxLength } from 'class-validator'

export class UpdateSeoSettingsDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  siteName?: string

  @IsOptional()
  @IsString()
  defaultOgImage?: string

  @IsOptional()
  @IsString()
  @MaxLength(200)
  titleTemplate?: string
}
