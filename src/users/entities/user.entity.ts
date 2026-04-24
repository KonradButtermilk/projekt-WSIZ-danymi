import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Progress } from '../../lessons/entities/progress.entity';

@Entity('users')
export class User {
  @ApiProperty({ description: 'Unique user ID', example: 'uuid-string' })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'User email address', example: 'user@example.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ description: 'Username', example: 'john_doe' })
  @Column({ unique: true })
  username: string;

  @Column()
  passwordHash: string;

  @ApiProperty({ description: 'Experience points', example: 120 })
  @Column({ default: 0 })
  xp: number;

  @ApiProperty({ description: 'Current streak in days', example: 5 })
  @Column({ default: 0 })
  streak: number;

  @ApiProperty({ description: 'Last active date', example: '2024-01-15' })
  @Column({ type: 'date', nullable: true })
  lastActiveDate: string | null;

  @ApiProperty({ description: 'Account creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({ description: 'Pro subscription status', example: false })
  @Column({ default: false })
  isPro: boolean;

  @OneToMany(() => Progress, (progress) => progress.user)
  progress: Progress[];
}
