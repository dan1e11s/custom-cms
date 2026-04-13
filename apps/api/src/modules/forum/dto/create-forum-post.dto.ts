import { IsInt, IsOptional, IsPositive, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateForumPostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(50000)
  content: string

  /** ID цитируемого сообщения (для цитирования) */
  @IsOptional()
  @IsInt()
  @IsPositive()
  quotePostId?: number
}
