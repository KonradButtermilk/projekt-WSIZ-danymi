import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './entities/course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Progress } from '../lessons/entities/progress.entity';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course)
    private readonly coursesRepository: Repository<Course>,
    @InjectRepository(Lesson)
    private readonly lessonsRepository: Repository<Lesson>,
    @InjectRepository(Progress)
    private readonly progressRepository: Repository<Progress>,
  ) {}

  async findAll(): Promise<Course[]> {
    return this.coursesRepository.find({
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Course> {
    const course = await this.coursesRepository.findOne({
      where: { id },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }
    return course;
  }

  async create(createCourseDto: CreateCourseDto): Promise<Course> {
    const course = this.coursesRepository.create(createCourseDto);
    return this.coursesRepository.save(course);
  }

  async getCourseLessons(
    courseId: string,
    userId: string,
  ): Promise<
    Array<{
      id: string;
      title: string;
      description: string;
      orderIndex: number;
      isUnlocked: boolean;
      isCompleted: boolean;
    }>
  > {
    const course = await this.coursesRepository.findOne({
      where: { id: courseId },
    });
    if (!course) {
      throw new NotFoundException('Course not found');
    }

    const lessons = await this.lessonsRepository.find({
      where: { courseId },
      order: { orderIndex: 'ASC' },
    });

    const progressRecords = await this.progressRepository.find({
      where: { userId },
    });

    const completedLessonIds = new Set(
      progressRecords
        .filter((p) => p.completed)
        .map((p) => p.lessonId),
    );

    return lessons.map((lesson, index) => {
      const progress = progressRecords.find(p => p.lessonId === lesson.id);
      const isCompleted = progress?.completed || false;
      const isUnlockedWithGems = progress?.unlockedWithGems || false;
      let isUnlocked = isUnlockedWithGems;

      if (index === 0) {
        // First lesson is always unlocked
        isUnlocked = true;
      } else if (!isUnlocked) {
        // Unlock if previous lesson is completed
        const prevLesson = lessons[index - 1];
        isUnlocked = completedLessonIds.has(prevLesson.id);
      }

      return {
        id: lesson.id,
        title: lesson.title,
        description: lesson.description,
        orderIndex: lesson.orderIndex,
        culturalContext: lesson.culturalContext,
        isPremium: lesson.isPremium,
        isUnlocked,
        isCompleted,
      };
    });
  }
}
