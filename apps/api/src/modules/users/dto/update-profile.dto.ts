import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsBoolean, IsOptional, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: 'john_doe', minLength: 3, maxLength: 30 })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'username may only contain letters, numbers, underscores and hyphens',
  })
  username?: string

  @ApiPropertyOptional({ example: 'Frontend разработчик' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string
}

export class SetActiveDto {
  @ApiPropertyOptional()
  @IsBoolean()
  isActive: boolean
}
