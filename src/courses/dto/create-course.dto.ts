import { ApiProperty } from '@nestjs/swagger';
import { IsString, MinLength, MaxLength, IsOptional } from 'class-validator';

export class CreateCourseDto {
  @ApiProperty({
    description: 'Course title',
    example: 'English for Beginners',
  })
  @IsString()
  @MinLength(3)
  @MaxLength(100)
  title: string;

  @ApiProperty({
    description: 'Target language',
    example: 'English',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  language: string;

  @ApiProperty({
    description: 'CEFR level (A1, A2, B1, B2, C1, C2)',
    example: 'A1',
  })
  @IsString()
  @MinLength(2)
  @MaxLength(5)
  level: string;

  @ApiProperty({
    description: 'Course description',
    example: 'Learn the basics of English language',
    required: false,
  })
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string;
}
