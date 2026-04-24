import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class UpdateUserDto {
  @ApiProperty({
    description: 'New username (3-30 characters)',
    example: 'new_username',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  username?: string;
}
