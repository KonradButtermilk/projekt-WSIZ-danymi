import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import { Lesson } from './lesson.entity';

@Entity('progress')
export class Progress {
  @ApiProperty({ description: 'Unique progress record ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User ID' })
  @Column()
  userId: string;

  @ApiProperty({ description: 'Lesson ID' })
  @Column()
  lessonId: string;

  @ApiProperty({ description: 'Whether the lesson has been completed' })
  @Column({ default: false })
  completed: boolean;

  @ApiProperty({ description: 'Quiz score percentage', example: 80 })
  @Column({ type: 'int', default: 0 })
  score: number;

  @ApiProperty({ description: 'Completion timestamp' })
  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date | null;

  @ManyToOne(() => User, (user) => user.progress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @ManyToOne(() => Lesson, (lesson) => lesson.progress, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'lessonId' })
  lesson: Lesson;
}
