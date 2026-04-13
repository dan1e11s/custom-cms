import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class UpdateThreadDto {
  @IsOptional()
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title?: string
}
