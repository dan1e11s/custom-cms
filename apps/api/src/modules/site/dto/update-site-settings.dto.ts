import { IsOptional, IsString } from 'class-validator'

export class UpdateSiteSettingsDto {
  @IsString()
  @IsOptional()
  siteName?: string

  @IsString()
  @IsOptional()
  defaultOgImage?: string

  @IsString()
  @IsOptional()
  titleTemplate?: string

  @IsString()
  @IsOptional()
  logoUrl?: string

  @IsString()
  @IsOptional()
  logoText?: string

  @IsString()
  @IsOptional()
  footerCopyright?: string
}
