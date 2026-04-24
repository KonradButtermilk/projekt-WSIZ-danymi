import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'Username (3-30 characters)',
    example: 'john_doe',
    minLength: 3,
    maxLength: 30,
  })
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username: string;

  @ApiProperty({
    description: 'Password (minimum 6 characters)',
    example: 'securePassword123',
    minLength: 6,
  })
  @IsString()
  @MinLength(6)
  password: string;
}
