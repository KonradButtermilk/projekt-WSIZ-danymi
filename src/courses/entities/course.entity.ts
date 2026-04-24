import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Lesson } from '../../lessons/entities/lesson.entity';

@Entity('courses')
export class Course {
  @ApiProperty({ description: 'Unique course ID' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Course title', example: 'English for Beginners' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Target language', example: 'English' })
  @Column()
  language: string;

  @ApiProperty({ description: 'CEFR level', example: 'A1' })
  @Column()
  level: string;

  @ApiProperty({ description: 'Course description' })
  @Column({ type: 'text', nullable: true })
  description: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Lesson, (lesson) => lesson.course)
  lessons: Lesson[];
}
