import { IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReviewFlashcardDto {
  @ApiProperty({ description: 'Quality of recall (0-5, where 5 is perfect)' })
  @IsNumber()
  @Min(0)
  @Max(5)
  quality: number;
}
