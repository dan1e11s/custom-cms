import { IsInt, IsOptional, IsString, MinLength } from 'class-validator'

export class CreateFooterColumnDto {
  @IsString()
  @MinLength(1)
  title: string

  @IsInt()
  @IsOptional()
  order?: number
}
