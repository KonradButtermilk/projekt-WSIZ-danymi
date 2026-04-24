import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Lesson } from '../../lessons/entities/lesson.entity';
import { Question } from './question.entity';

@Entity('quizzes')
export class Quiz {
  @ApiProperty({ description: 'Unique quiz ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Lesson ID this quiz belongs to' })
  @Column({ unique: true })
  lessonId: string;

  @ApiProperty({ description: 'Quiz title', example: 'Greetings Quiz' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Minimum passing score percentage', example: 60 })
  @Column({ default: 60 })
  passingScore: number;

  @OneToOne(() => Lesson, (lesson) => lesson.quiz, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;

  @OneToMany(() => Question, (question) => question.quiz)
  questions: Question[];
}
