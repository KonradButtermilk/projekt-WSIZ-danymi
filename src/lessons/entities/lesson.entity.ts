import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  OneToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Course } from '../../courses/entities/course.entity';
import { Quiz } from '../../quizzes/entities/quiz.entity';
import { Progress } from './progress.entity';

@Entity('lessons')
export class Lesson {
  @ApiProperty({ description: 'Unique lesson ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Course ID this lesson belongs to' })
  @Column()
  courseId: string;

  @ApiProperty({ description: 'Lesson title', example: 'Greetings' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Lesson description' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Cultural context note (2026 feature)', required: false })
  @Column({ type: 'text', nullable: true })
  culturalContext: string;

  @ApiProperty({ description: 'Order within the course (1-based)', example: 1 })
  @Column()
  orderIndex: number;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => Course, (course) => course.lessons, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'courseId' })
  course: Course;

  @OneToOne(() => Quiz, (quiz) => quiz.lesson)
  quiz: Quiz;

  @OneToMany(() => Progress, (progress) => progress.lesson)
  progress: Progress[];
}
