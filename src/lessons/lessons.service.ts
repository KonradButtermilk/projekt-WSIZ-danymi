import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lesson } from './entities/lesson.entity';
import { Progress } from './entities/progress.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class LessonsService {
  constructor(
    @InjectRepository(Lesson)
    private readonly lessonsRepository: Repository<Lesson>,
    @InjectRepository(Progress)
    private readonly progressRepository: Repository<Progress>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async findOne(
    id: string,
    userId: string,
  ): Promise<Lesson & { isUnlocked: boolean; isCompleted: boolean }> {
    const lesson = await this.lessonsRepository.findOne({
      where: { id },
      relations: ['course'],
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    const isUnlocked = await this.isLessonUnlocked(lesson, userId);
    const progress = await this.progressRepository.findOne({
      where: { userId, lessonId: id, completed: true },
    });

    return {
      ...lesson,
      isUnlocked,
      isCompleted: !!progress,
    };
  }

  async completeLesson(
    lessonId: string,
    userId: string,
    score: number,
  ): Promise<{
    message: string;
    xpEarned: number;
    totalXp: number;
    streak: number;
    score: number;
    passed: boolean;
  }> {
    const lesson = await this.lessonsRepository.findOne({
      where: { id: lessonId },
    });
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    // Check if lesson is unlocked
    const isUnlocked = await this.isLessonUnlocked(lesson, userId);
    if (!isUnlocked) {
      throw new ForbiddenException(
        'This lesson is locked. Complete the previous lesson first.',
      );
    }

    const passed = score >= 60;
    if (!passed) {
      return {
        message: 'Quiz not passed. Score below 60%.',
        xpEarned: 0,
        totalXp: 0,
        streak: 0,
        score,
        passed: false,
      };
    }

    // Check if already completed
    const existingProgress = await this.progressRepository.findOne({
      where: { userId, lessonId },
    });

    let xpEarned = 0;

    if (existingProgress && existingProgress.completed) {
      // Already completed - update score if higher, no XP
      if (score > existingProgress.score) {
        existingProgress.score = score;
        await this.progressRepository.save(existingProgress);
      }
    } else if (existingProgress) {
      // Exists but not completed
      existingProgress.completed = true;
      existingProgress.score = score;
      existingProgress.completedAt = new Date();
      await this.progressRepository.save(existingProgress);
      xpEarned = 10;
    } else {
      // New completion
      const progress = this.progressRepository.create({
        userId,
        lessonId,
        completed: true,
        score,
        completedAt: new Date(),
      });
      await this.progressRepository.save(progress);
      xpEarned = 10;
    }

    // Update user XP and streak
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.xp += xpEarned;
    this.updateStreak(user);
    await this.usersRepository.save(user);

    return {
      message: 'Lesson completed successfully!',
      xpEarned,
      totalXp: user.xp,
      streak: user.streak,
      score,
      passed: true,
    };
  }

  private async isLessonUnlocked(
    lesson: Lesson,
    userId: string,
  ): Promise<boolean> {
    // First lesson in a course is always unlocked
    if (lesson.orderIndex === 1) {
      return true;
    }

    // Find the previous lesson
    const previousLesson = await this.lessonsRepository.findOne({
      where: {
        courseId: lesson.courseId,
        orderIndex: lesson.orderIndex - 1,
      },
    });

    if (!previousLesson) {
      // No previous lesson found, unlock by default
      return true;
    }

    // Check if previous lesson is completed
    const progress = await this.progressRepository.findOne({
      where: {
        userId,
        lessonId: previousLesson.id,
        completed: true,
      },
    });

    return !!progress;
  }

  private updateStreak(user: User): void {
    const today = new Date().toISOString().split('T')[0];

    if (!user.lastActiveDate) {
      user.streak = 1;
      user.lastActiveDate = today;
      return;
    }

    const lastActive = new Date(user.lastActiveDate);
    const todayDate = new Date(today);
    const diffTime = todayDate.getTime() - lastActive.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      // Same day, no streak change
      return;
    } else if (diffDays === 1) {
      // Consecutive day, increment streak
      user.streak += 1;
    } else {
      // Streak broken, reset
      user.streak = 1;
    }

    user.lastActiveDate = today;
  }
}
