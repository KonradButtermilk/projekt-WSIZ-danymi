import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ValidateNested, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

export class QuizAnswerDto {
  @ApiProperty({
    description: 'Question ID',
    example: 'uuid-string',
  })
  @IsUUID()
  questionId: string;

  @ApiProperty({
    description: 'Answer text (for text_input) or answer ID (for multiple_choice)',
    example: 'Hallo',
  })
  @IsString()
  answer: string;
}

export class SubmitQuizDto {
  @ApiProperty({
    description: 'Array of answers for each question',
    type: [QuizAnswerDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => QuizAnswerDto)
  answers: QuizAnswerDto[];
}
