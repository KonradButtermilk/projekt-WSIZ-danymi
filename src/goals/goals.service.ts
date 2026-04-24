import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DailyGoal } from './entities/daily-goal.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class GoalsService {
  constructor(
    @InjectRepository(DailyGoal)
    private goalsRepository: Repository<DailyGoal>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  private getTodayDateString(): string {
    return new Date().toISOString().split('T')[0];
  }

  async getTodayGoals(userId: string) {
    const today = this.getTodayDateString();
    let goals = await this.goalsRepository.find({
      where: { user: { id: userId }, date: today },
    });

    if (goals.length === 0) {
      // Generate daily goals
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (!user) return [];

      const newGoals = [
        this.goalsRepository.create({
          user,
          date: today,
          goalType: 'xp',
          targetValue: 50,
          currentValue: 0,
          rewardXp: 10,
        }),
        this.goalsRepository.create({
          user,
          date: today,
          goalType: 'lessons',
          targetValue: 2,
          currentValue: 0,
          rewardXp: 15,
        }),
        this.goalsRepository.create({
          user,
          date: today,
          goalType: 'flashcards',
          targetValue: 10,
          currentValue: 0,
          rewardXp: 5,
        }),
      ];
      goals = await this.goalsRepository.save(newGoals);
    }
    return goals;
  }

  async progressGoal(userId: string, goalType: string, amount: number = 1) {
    const today = this.getTodayDateString();
    const goals = await this.goalsRepository.find({
      where: { user: { id: userId }, date: today, goalType, isCompleted: false },
    });

    for (const goal of goals) {
      goal.currentValue += amount;
      if (goal.currentValue >= goal.targetValue) {
        goal.currentValue = goal.targetValue;
        goal.isCompleted = true;

        // Reward user
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (user) {
          user.xp += goal.rewardXp;
          await this.userRepository.save(user);
        }
      }
      await this.goalsRepository.save(goal);
    }
  }
}
