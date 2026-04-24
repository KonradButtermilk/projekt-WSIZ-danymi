import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LessonsService } from './lessons.service';
import { LessonsController } from './lessons.controller';
import { Lesson } from './entities/lesson.entity';
import { Progress } from './entities/progress.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Lesson, Progress, User])],
  controllers: [LessonsController],
  providers: [LessonsService],
  exports: [LessonsService],
})
export class LessonsModule {}
