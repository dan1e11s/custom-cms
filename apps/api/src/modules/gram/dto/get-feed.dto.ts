import { Type } from 'class-transformer'
import { IsNumber, IsOptional, IsPositive, Max, Min } from 'class-validator'

export class GetFeedDto {
  /** ID последнего поста из предыдущей страницы (cursor) */
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @IsPositive()
  cursor?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(50)
  limit?: number = 20
}
