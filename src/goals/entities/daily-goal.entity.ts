import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity('daily_goals')
export class DailyGoal {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @Column({ type: 'date' })
  date: string; // YYYY-MM-DD

  @Column()
  goalType: string; // e.g., 'xp', 'lessons'

  @Column({ type: 'int' })
  targetValue: number;

  @Column({ type: 'int', default: 0 })
  currentValue: number;

  @Column({ default: false })
  isCompleted: boolean;

  @Column({ type: 'int' })
  rewardXp: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
