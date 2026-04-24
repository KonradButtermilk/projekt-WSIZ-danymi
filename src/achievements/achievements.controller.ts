import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AchievementsService } from './achievements.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Achievements')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('achievements')
export class AchievementsController {
  constructor(private readonly achievementsService: AchievementsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available achievements' })
  @ApiResponse({ status: 200, description: 'List of all achievements.' })
  getAll() {
    return this.achievementsService.getAllAchievements();
  }

  @Get('me')
  @ApiOperation({ summary: 'Get achievements unlocked by the current user' })
  @ApiResponse({ status: 200, description: 'List of unlocked achievements.' })
  getMine(@CurrentUser() user: User) {
    return this.achievementsService.getUserAchievements(user.id);
  }

  @Post('check')
  @ApiOperation({ summary: 'Check and award new achievements based on current stats' })
  @ApiResponse({ status: 201, description: 'Achievements checked and awarded if applicable.' })
  checkAwards(@CurrentUser() user: User) {
    return this.achievementsService.checkAndAwardAchievements(user.id);
  }
}
