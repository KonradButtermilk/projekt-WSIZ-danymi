import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AchievementsService } from './achievements.service';
import { AchievementsController } from './achievements.controller';
import { Achievement } from './entities/achievement.entity';
import { UserAchievement } from './entities/user-achievement.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Achievement, UserAchievement, User])],
  controllers: [AchievementsController],
  providers: [AchievementsService],
  exports: [AchievementsService],
})
export class AchievementsModule {}
