import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateCommentDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string

  /** ID родительского комментария для ответа */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  parentId?: number
}
