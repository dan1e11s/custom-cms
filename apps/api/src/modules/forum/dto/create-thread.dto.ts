import { IsInt, IsPositive, IsString, MaxLength, MinLength } from 'class-validator'

export class CreateThreadDto {
  @IsString()
  @MinLength(5)
  @MaxLength(200)
  title: string

  @IsInt()
  @IsPositive()
  sectionId: number

  /** Первое сообщение — тело темы */
  @IsString()
  @MinLength(10)
  @MaxLength(50000)
  content: string
}
