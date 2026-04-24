import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { GoalsService } from './goals.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Goals')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('goals')
export class GoalsController {
  constructor(private readonly goalsService: GoalsService) {}

  @Get('today')
  @ApiOperation({ summary: 'Get daily goals for the current user' })
  @ApiResponse({ status: 200, description: 'List of daily goals.' })
  getTodayGoals(@CurrentUser() user: User) {
    return this.goalsService.getTodayGoals(user.id);
  }

  @Post('progress')
  @ApiOperation({ summary: 'Update progress for a specific goal type' })
  progressGoal(
    @CurrentUser() user: User,
    @Body('goalType') goalType: string,
    @Body('amount') amount: number = 1
  ) {
    return this.goalsService.progressGoal(user.id, goalType, amount);
  }
}
