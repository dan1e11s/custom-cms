import { IsBoolean, IsIn, IsOptional, IsString, Matches, MaxLength } from 'class-validator'

export class CreateRedirectDto {
  @IsString()
  @MaxLength(500)
  @Matches(/^\//, { message: 'Путь "from" должен начинаться с /' })
  from: string

  @IsString()
  @MaxLength(500)
  to: string

  @IsOptional()
  @IsIn([301, 302])
  statusCode?: number
}

export class UpdateRedirectDto {
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @IsOptional()
  @IsString()
  @MaxLength(500)
  to?: string

  @IsOptional()
  @IsIn([301, 302])
  statusCode?: number
}
