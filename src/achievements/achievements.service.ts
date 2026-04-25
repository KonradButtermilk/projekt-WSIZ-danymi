import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Achievement } from './entities/achievement.entity';
import { UserAchievement } from './entities/user-achievement.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class AchievementsService {
  constructor(
    @InjectRepository(Achievement)
    private achievementRepository: Repository<Achievement>,
    @InjectRepository(UserAchievement)
    private userAchievementRepository: Repository<UserAchievement>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getUserAchievements(userId: string) {
    return this.userAchievementRepository.find({
      where: { user: { id: userId } },
      relations: ['achievement'],
      order: { unlockedAt: 'DESC' },
    });
  }

  async getAllAchievements() {
    return this.achievementRepository.find();
  }

  async checkAndAwardAchievements(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) return;

    const allAchievements = await this.achievementRepository.find();
    const userAchievements = await this.userAchievementRepository.find({
      where: { user: { id: userId } },
      relations: ['achievement'],
    });

    const unlockedIds = new Set(userAchievements.map(ua => ua.achievement.id));
    const newAwards = [];

    for (const achievement of allAchievements) {
      if (unlockedIds.has(achievement.id)) continue;

      let meetsRequirement = false;
      switch (achievement.requirementType) {
        case 'xp':
          meetsRequirement = user.xp >= achievement.requirementValue;
          break;
        case 'streak':
          meetsRequirement = user.streak >= achievement.requirementValue;
          break;
        case 'lessons_done':
          const lessonsCount = await this.userRepository.manager.count('progress', { where: { userId, completed: true } });
          meetsRequirement = lessonsCount >= achievement.requirementValue;
          break;
        case 'perfect_quiz':
          const perfectCount = await this.userRepository.manager.count('progress', { where: { userId, score: 100 } });
          meetsRequirement = perfectCount >= achievement.requirementValue;
          break;
        case 'flashcards_count':
          const flashcardsCount = await this.userRepository.manager.count('flashcard', { where: { user: { id: userId } } });
          meetsRequirement = flashcardsCount >= achievement.requirementValue;
          break;
        case 'is_pro':
          meetsRequirement = user.isPro === true;
          break;
      }

      if (meetsRequirement) {
        const ua = this.userAchievementRepository.create({
          user,
          achievement,
        });
        newAwards.push(ua);
      }
    }

    if (newAwards.length > 0) {
      await this.userAchievementRepository.save(newAwards);
    }
  }
}
