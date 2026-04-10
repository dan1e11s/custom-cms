import { ApiProperty } from '@nestjs/swagger'
import { IsEmail, IsString, Matches, MaxLength, MinLength } from 'class-validator'

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string

  @ApiProperty({ example: 'john_doe', minLength: 3, maxLength: 30 })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_-]+$/, {
    message: 'username may only contain letters, numbers, underscores and hyphens',
  })
  username: string

  @ApiProperty({ example: 'password123', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string
}
