import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { ApiProperty } from '@nestjs/swagger';

@Entity('flashcards')
export class Flashcard {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.id, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  front: string;

  @Column()
  back: string;

  @ApiProperty({ description: 'Next review date' })
  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  nextReview: Date;

  @Column({ type: 'int', default: 0 })
  interval: number; // in days

  @ApiProperty({ description: 'Ease factor for SM-2', example: 2.5 })
  @Column({ type: 'float', default: 2.5 })
  easeFactor: number;

  @ApiProperty({ description: 'Mnemonic or association (Pałac pamięci)', required: false })
  @Column({ type: 'text', nullable: true })
  mnemonic: string;

  @ApiProperty({ description: 'Specific location in the memory palace', required: false })
  @Column({ type: 'varchar', length: 255, nullable: true })
  palaceLocation: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
