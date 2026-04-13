import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateGramCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(1000)
  content: string

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  parentId?: number
}
