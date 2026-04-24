import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Course } from '../courses/entities/course.entity';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Quiz } from '../quizzes/entities/quiz.entity';
import { Question, QuestionType } from '../quizzes/entities/question.entity';
import { Answer } from '../quizzes/entities/answer.entity';
import { Achievement } from '../achievements/entities/achievement.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(Course) private courseRepository: Repository<Course>,
    @InjectRepository(Lesson) private lessonRepository: Repository<Lesson>,
    @InjectRepository(Quiz) private quizRepository: Repository<Quiz>,
    @InjectRepository(Question) private questionRepository: Repository<Question>,
    @InjectRepository(Answer) private answerRepository: Repository<Answer>,
    @InjectRepository(Achievement) private achievementRepository: Repository<Achievement>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    const userCount = await this.userRepository.count();
    if (userCount > 0) {
      this.logger.log('Database already seeded, skipping...');
      return;
    }

    this.logger.log('Seeding database...');

    await this.seedAchievements();

    const hashedPassword = await bcrypt.hash('demo1234', 10);
    const user = this.userRepository.create({
      email: 'demo@example.com',
      username: 'learner1',
      passwordHash: hashedPassword,
      xp: 0,
      streak: 0,
    });
    await this.userRepository.save(user);

    const course1 = this.courseRepository.create({
      title: 'English for Beginners',
      description: 'Start your English learning journey with basic vocabulary, greetings, and simple sentences.',
      language: 'English',
      level: 'A1',
    });
    
    const course2 = this.courseRepository.create({
      title: 'German Basics',
      description: 'Learn the fundamentals of German language including common phrases and basic grammar.',
      language: 'German',
      level: 'A1',
    });

    const course3 = this.courseRepository.create({
      title: 'Spanish Survival Guide',
      description: 'Practical Spanish phrases and vocabulary for traveling in Latin America and Spain.',
      language: 'Spanish',
      level: 'A1',
    });

    await this.courseRepository.save([course1, course2, course3]);

    await this.seedLessons(course1, 'English');
    await this.seedLessons(course2, 'German');
    await this.seedLessons(course3, 'Spanish');

    this.logger.log('Database seeded successfully!');
  }

  private async seedAchievements() {
    const achievements = [
      { title: 'First Steps', description: 'Complete your first lesson.', icon: '🌱', requirementType: 'lessons_done', requirementValue: 1 },
      { title: 'Consistent Learner', description: 'Reach a 3-day streak.', icon: '🔥', requirementType: 'streak', requirementValue: 3 },
      { title: 'Scholar', description: 'Earn 100 XP.', icon: '🎓', requirementType: 'xp', requirementValue: 100 },
      { title: 'Perfect Score', description: 'Get 100% on a quiz.', icon: '⭐', requirementType: 'perfect_quiz', requirementValue: 1 },
    ];
    for (const ach of achievements) {
      await this.achievementRepository.save(this.achievementRepository.create(ach));
    }
  }

  private async seedLessons(course: Course, language: string) {
    let lessonsData: { title: string; desc: string; context: string | null }[] = [];
    if (language === 'English') {
      lessonsData = [
        { title: 'Greetings & Introductions', desc: 'Learn basic greetings and how to introduce yourself in English.', context: null },
        { title: 'Numbers 1-20', desc: 'Learn to count from 1 to 20 in English.', context: null },
        { title: 'Colors', desc: 'Learn the names of basic colors in English.', context: null },
      ];
    } else if (language === 'German') {
      lessonsData = [
        { title: 'Begrüßungen', desc: 'Learn basic greetings in German.', context: null },
        { title: 'Zahlen 1-10', desc: 'Learn to count from 1 to 10 in German.', context: null },
        { title: 'Farben', desc: 'Learn the names of basic colors in German.', context: null },
      ];
    } else if (language === 'Spanish') {
      lessonsData = [
        { title: 'At the Cafe', desc: 'Learn how to order food and drinks at a local cafe.', context: 'In Spain, cafes are a central part of daily life. It is common to order a "Café con leche" (coffee with milk) in the morning along with a tostada.' },
      ];
    }

    for (let i = 0; i < lessonsData.length; i++) {
      const lesson = this.lessonRepository.create({
        courseId: course.id,
        title: lessonsData[i].title,
        description: lessonsData[i].desc,
        culturalContext: lessonsData[i].context || undefined,
        orderIndex: i + 1,
      });
      await this.lessonRepository.save(lesson);

      const quiz = this.quizRepository.create({
        lessonId: lesson.id,
        title: `${lesson.title} Quiz`,
        passingScore: 60,
      });
      await this.quizRepository.save(quiz);

      await this.seedQuestions(quiz, language, i);
    }
  }

  private async seedQuestions(quiz: Quiz, language: string, index: number) {
    if (language === 'English') {
      if (index === 0) {
        const q1 = await this.questionRepository.save(this.questionRepository.create({
          quizId: quiz.id, text: 'Translate: Dom', type: QuestionType.MULTIPLE_CHOICE, orderIndex: 1
        }));
        await this.answerRepository.save([
          { questionId: q1.id, text: 'House', isCorrect: true },
          { questionId: q1.id, text: 'Car', isCorrect: false },
          { questionId: q1.id, text: 'Dog', isCorrect: false },
          { questionId: q1.id, text: 'Cat', isCorrect: false }
        ]);

        const q2 = await this.questionRepository.save(this.questionRepository.create({
          quizId: quiz.id, text: 'Translate: Jabłko', type: QuestionType.MULTIPLE_CHOICE, orderIndex: 2
        }));
        await this.answerRepository.save([
          { questionId: q2.id, text: 'Orange', isCorrect: false },
          { questionId: q2.id, text: 'Apple', isCorrect: true },
          { questionId: q2.id, text: 'Banana', isCorrect: false },
          { questionId: q2.id, text: 'Grape', isCorrect: false }
        ]);
      } else {
        const q1 = await this.questionRepository.save(this.questionRepository.create({
          quizId: quiz.id, text: 'Translate: Woda', type: QuestionType.MULTIPLE_CHOICE, orderIndex: 1
        }));
        await this.answerRepository.save([
          { questionId: q1.id, text: 'Water', isCorrect: true },
          { questionId: q1.id, text: 'Fire', isCorrect: false },
        ]);
      }
    } else if (language === 'German') {
      if (index === 0) {
        const q1 = await this.questionRepository.save(this.questionRepository.create({
          quizId: quiz.id, text: 'Translate: Guten Morgen', type: QuestionType.MULTIPLE_CHOICE, orderIndex: 1
        }));
        await this.answerRepository.save([
          { questionId: q1.id, text: 'Good morning', isCorrect: true },
          { questionId: q1.id, text: 'Good night', isCorrect: false },
          { questionId: q1.id, text: 'Goodbye', isCorrect: false },
          { questionId: q1.id, text: 'Hello', isCorrect: false }
        ]);
      } else {
        const q1 = await this.questionRepository.save(this.questionRepository.create({
          quizId: quiz.id, text: 'Translate: Apfel', type: QuestionType.MULTIPLE_CHOICE, orderIndex: 1
        }));
        await this.answerRepository.save([
          { questionId: q1.id, text: 'Apple', isCorrect: true },
          { questionId: q1.id, text: 'Water', isCorrect: false },
        ]);
      }
    } else if (language === 'Spanish') {
      const q1 = await this.questionRepository.save(this.questionRepository.create({
        quizId: quiz.id, text: 'You are at a cafe in Madrid. Order a coffee with milk.', type: QuestionType.SITUATIONAL_CHAT, orderIndex: 1
      }));
      await this.answerRepository.save([
        { questionId: q1.id, text: 'Un café con leche, por favor', isCorrect: true }
      ]);
    }
  }
}
