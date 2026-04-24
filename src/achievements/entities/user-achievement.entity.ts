import { Entity, PrimaryGeneratedColumn, ManyToOne, CreateDateColumn, Unique } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Achievement } from './achievement.entity';

@Entity('user_achievements')
@Unique(['user', 'achievement'])
export class UserAchievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ManyToOne(() => Achievement, { onDelete: 'CASCADE' })
  achievement: Achievement;

  @CreateDateColumn()
  unlockedAt: Date;
}
