import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeaderboardService } from './leaderboard.service';
import { LeaderboardController } from './leaderboard.controller';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [LeaderboardController],
  providers: [LeaderboardService],
})
export class LeaderboardModule {}
