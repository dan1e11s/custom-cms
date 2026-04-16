import { IsBoolean, IsInt, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateFooterLinkDto {
  @IsString()
  @MinLength(1)
  label: string

  @IsString()
  @MinLength(1)
  href: string

  @IsInt()
  columnId: number

  @IsInt()
  @IsOptional()
  order?: number

  @IsBoolean()
  @IsOptional()
  openInNewTab?: boolean
}
