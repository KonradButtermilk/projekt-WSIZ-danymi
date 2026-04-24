import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('achievements')
export class Achievement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  description: string;

  @Column()
  icon: string; // e.g., emoji like '🔥', '🏆'

  @Column()
  requirementType: string; // e.g., 'xp', 'streak', 'lessons_done'

  @Column({ type: 'int' })
  requirementValue: number;

  @CreateDateColumn()
  createdAt: Date;
}
