import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Quiz } from './quiz.entity';
import { Answer } from './answer.entity';

export enum QuestionType {
  MULTIPLE_CHOICE = 'multiple_choice',
  TEXT_INPUT = 'text_input',
  SPEAKING_SIMULATION = 'speaking_simulation',
  SITUATIONAL_CHAT = 'situational_chat',
}

@Entity('questions')
export class Question {
  @ApiProperty({ description: 'Unique question ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Quiz ID this question belongs to' })
  @Column()
  quizId: string;

  @ApiProperty({ description: 'Question text', example: 'What is "Hello" in German?' })
  @Column({ type: 'text' })
  text: string;

  @ApiProperty({
    description: 'Question type',
    enum: QuestionType,
    example: QuestionType.MULTIPLE_CHOICE,
  })
  @Column({ type: 'varchar', default: QuestionType.MULTIPLE_CHOICE })
  type: QuestionType;

  @ApiProperty({ description: 'Order within the quiz', example: 1 })
  @Column({ default: 1 })
  orderIndex: number;

  @ManyToOne(() => Quiz, (quiz) => quiz.questions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'quizId' })
  quiz: Quiz;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];
}
