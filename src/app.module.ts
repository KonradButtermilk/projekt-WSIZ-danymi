import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CoursesModule } from './courses/courses.module';
import { LessonsModule } from './lessons/lessons.module';
import { QuizzesModule } from './quizzes/quizzes.module';
import { SeedModule } from './seed/seed.module';
import { User } from './users/entities/user.entity';
import { Course } from './courses/entities/course.entity';
import { Lesson } from './lessons/entities/lesson.entity';
import { Progress } from './lessons/entities/progress.entity';
import { Quiz } from './quizzes/entities/quiz.entity';
import { Question } from './quizzes/entities/question.entity';
import { Answer } from './quizzes/entities/answer.entity';
import { FlashcardsModule } from './flashcards/flashcards.module';
import { AchievementsModule } from './achievements/achievements.module';
import { GoalsModule } from './goals/goals.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { Flashcard } from './flashcards/entities/flashcard.entity';
import { Achievement } from './achievements/entities/achievement.entity';
import { UserAchievement } from './achievements/entities/user-achievement.entity';
import { DailyGoal } from './goals/entities/daily-goal.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api/(.*)'],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres' as const,
        url: configService.get<string>('DATABASE_URL'),
        entities: [User, Course, Lesson, Progress, Quiz, Question, Answer, Flashcard, Achievement, UserAchievement, DailyGoal],
        synchronize: true,
        ssl: configService.get<string>('DATABASE_URL')?.includes('supabase')
          ? { rejectUnauthorized: false }
          : false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UsersModule,
    CoursesModule,
    LessonsModule,
    QuizzesModule,
    SeedModule,
    FlashcardsModule,
    AchievementsModule,
    GoalsModule,
    LeaderboardModule,
  ],
})
export class AppModule {}
