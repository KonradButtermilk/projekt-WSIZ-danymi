import {
  Controller,
  Get,
  Post,
  Param,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiParam,
} from '@nestjs/swagger';
import { LessonsService } from './lessons.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Lessons')
@Controller('lessons')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('bearer')
export class LessonsController {
  constructor(private readonly lessonsService: LessonsService) {}

  @Get(':id')
  @ApiOperation({ summary: 'Get lesson details with unlock status' })
  @ApiParam({ name: 'id', description: 'Lesson UUID' })
  @ApiResponse({
    status: 200,
    description: 'Lesson details with unlock and completion status',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        courseId: { type: 'string' },
        title: { type: 'string' },
        description: { type: 'string' },
        orderIndex: { type: 'number' },
        isUnlocked: { type: 'boolean' },
        isCompleted: { type: 'boolean' },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.lessonsService.findOne(id, user.id);
  }

  @Post(':id/complete')
  @ApiOperation({
    summary: 'Mark lesson as complete (used internally after quiz pass)',
  })
  @ApiParam({ name: 'id', description: 'Lesson UUID' })
  @ApiResponse({
    status: 201,
    description: 'Lesson completion result',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        xpEarned: { type: 'number' },
        totalXp: { type: 'number' },
        streak: { type: 'number' },
        score: { type: 'number' },
        passed: { type: 'boolean' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({
    status: 403,
    description: 'Lesson is locked - complete previous lesson first',
  })
  @ApiResponse({ status: 404, description: 'Lesson not found' })
  async completeLesson(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    // This endpoint is primarily called via quiz submission
    // Direct calls default to 100% score
    return this.lessonsService.completeLesson(id, user.id, 100);
  }
}
