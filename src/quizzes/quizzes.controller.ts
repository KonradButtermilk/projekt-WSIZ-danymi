import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { QuizzesService } from './quizzes.service';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Quizzes')
@Controller('quizzes')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('bearer')
export class QuizzesController {
  constructor(private readonly quizzesService: QuizzesService) {}

  @Get('lesson/:lessonId')
  @ApiOperation({
    summary: 'Get quiz with questions for a specific lesson',
  })
  @ApiParam({ name: 'lessonId', description: 'Lesson UUID' })
  @ApiResponse({
    status: 200,
    description: 'Quiz with questions (answers hidden for text_input)',
    schema: {
      type: 'object',
      properties: {
        quiz: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            lessonId: { type: 'string' },
            title: { type: 'string' },
            passingScore: { type: 'number' },
          },
        },
        questions: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              text: { type: 'string' },
              type: {
                type: 'string',
                enum: ['multiple_choice', 'text_input'],
              },
              orderIndex: { type: 'number' },
              answers: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    id: { type: 'string' },
                    text: { type: 'string' },
                  },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Lesson or quiz not found' })
  async findByLesson(
    @Param('lessonId', ParseUUIDPipe) lessonId: string,
    @CurrentUser() user: User,
  ) {
    return this.quizzesService.findByLessonId(lessonId, user.id);
  }

  @Post(':id/submit')
  @ApiOperation({
    summary: 'Submit quiz answers and get score',
  })
  @ApiParam({ name: 'id', description: 'Quiz UUID' })
  @ApiBody({ type: SubmitQuizDto })
  @ApiResponse({
    status: 201,
    description: 'Quiz submission result with score and pass/fail',
    schema: {
      type: 'object',
      properties: {
        score: { type: 'number', example: 4 },
        totalQuestions: { type: 'number', example: 5 },
        correctAnswers: { type: 'number', example: 4 },
        percentage: { type: 'number', example: 80 },
        passed: { type: 'boolean', example: true },
        message: { type: 'string' },
        xpEarned: { type: 'number', example: 10 },
        totalXp: { type: 'number', example: 30 },
        streak: { type: 'number', example: 1 },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Quiz not found' })
  async submitQuiz(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
    @Body() submitQuizDto: SubmitQuizDto,
  ) {
    return this.quizzesService.submitQuiz(id, user.id, submitQuizDto);
  }
}
