import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Question } from './question.entity';

@Entity('answers')
export class Answer {
  @ApiProperty({ description: 'Unique answer ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Question ID this answer belongs to' })
  @Column()
  questionId: string;

  @ApiProperty({ description: 'Answer text', example: 'Hallo' })
  @Column()
  text: string;

  @ApiProperty({ description: 'Whether this is the correct answer' })
  @Column({ default: false })
  isCorrect: boolean;

  @ManyToOne(() => Question, (question) => question.answers, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'questionId' })
  question: Question;
}
