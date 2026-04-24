import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoalsService } from './goals.service';
import { GoalsController } from './goals.controller';
import { DailyGoal } from './entities/daily-goal.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DailyGoal, User])],
  controllers: [GoalsController],
  providers: [GoalsService],
  exports: [GoalsService],
})
export class GoalsModule {}
