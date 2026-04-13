import { IsArray, IsOptional, IsString, MaxLength, MinLength, ArrayMaxSize } from 'class-validator'

export class CreateGramPostDto {
  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  content: string

  /** URL изображений из медиатеки (до 10 штук) */
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  @ArrayMaxSize(10)
  images?: string[]
}
