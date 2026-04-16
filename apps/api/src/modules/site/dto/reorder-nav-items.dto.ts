import { IsArray, IsInt } from 'class-validator'

export class ReorderNavItemsDto {
  @IsArray()
  @IsInt({ each: true })
  ids: number[]
}
