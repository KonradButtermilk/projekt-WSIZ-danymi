import { Controller, Get, Query } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';

@ApiTags('Leaderboard')
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get()
  @ApiOperation({ summary: 'Get top users by XP' })
  @ApiResponse({ status: 200, description: 'List of top users.' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getLeaderboard(@Query('limit') limit?: number) {
    return this.leaderboardService.getTopUsers(limit || 10);
  }
}
