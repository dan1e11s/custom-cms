import { IsBoolean, IsOptional } from 'class-validator'

export class PinLockThreadDto {
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean

  @IsOptional()
  @IsBoolean()
  isLocked?: boolean
}
