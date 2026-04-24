import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Quiz } from '../quizzes/entities/quiz.entity';
import { Question } from '../quizzes/entities/question.entity';
import { Answer } from '../quizzes/entities/answer.entity';
import { Achievement } from '../achievements/entities/achievement.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Course, Lesson, Quiz, Question, Answer, Achievement]),
  ],
  providers: [SeedService],
})
export class SeedModule {}
