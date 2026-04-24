import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { QuizzesService } from './quizzes.service';
import { QuizzesController } from './quizzes.controller';
import { Quiz } from './entities/quiz.entity';
import { Question } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Progress } from '../lessons/entities/progress.entity';
import { LessonsModule } from '../lessons/lessons.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Quiz, Question, Answer, Lesson, Progress]),
    LessonsModule,
  ],
  controllers: [QuizzesController],
  providers: [QuizzesService],
  exports: [QuizzesService],
})
export class QuizzesModule {}
