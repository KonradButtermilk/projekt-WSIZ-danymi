import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CoursesService } from './courses.service';
import { CoursesController } from './courses.controller';
import { Course } from './entities/course.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Progress } from '../lessons/entities/progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Course, Lesson, Progress])],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
