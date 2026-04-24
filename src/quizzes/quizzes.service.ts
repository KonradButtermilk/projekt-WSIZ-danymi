import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Quiz } from './entities/quiz.entity';
import { Question, QuestionType } from './entities/question.entity';
import { Answer } from './entities/answer.entity';
import { SubmitQuizDto } from './dto/submit-quiz.dto';
import { LessonsService } from '../lessons/lessons.service';
import { Lesson } from '../lessons/entities/lesson.entity';
import { Progress } from '../lessons/entities/progress.entity';

@Injectable()
export class QuizzesService {
  constructor(
    @InjectRepository(Quiz)
    private readonly quizzesRepository: Repository<Quiz>,
    @InjectRepository(Question)
    private readonly questionsRepository: Repository<Question>,
    @InjectRepository(Answer)
    private readonly answersRepository: Repository<Answer>,
    @InjectRepository(Lesson)
    private readonly lessonsRepository: Repository<Lesson>,
    @InjectRepository(Progress)
    private readonly progressRepository: Repository<Progress>,
    private readonly lessonsService: LessonsService,
  ) {}

  async findByLessonId(lessonId: string, userId: string): Promise<{
    quiz: Quiz;
    questions: Array<{
      id: string;
      text: string;
      type: QuestionType;
      orderIndex: number;
      answers?: Array<{ id: string; text: string }>;
    }>;
  }> {
    const lesson = await this.lessonsService.findOne(lessonId, userId);
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    if (!lesson.isUnlocked) {
      throw new ForbiddenException('This lesson is locked. Complete the previous lesson first.');
    }

    const quiz = await this.quizzesRepository.findOne({
      where: { lessonId },
    });
    if (!quiz) {
      throw new NotFoundException('Quiz not found for this lesson');
    }

    const questions = await this.questionsRepository.find({
      where: { quizId: quiz.id },
      order: { orderIndex: 'ASC' },
      relations: ['answers'],
    });

    const sanitizedQuestions = questions.map((q) => {
      const base: {
        id: string;
        text: string;
        type: QuestionType;
        orderIndex: number;
        answers?: Array<{ id: string; text: string }>;
      } = {
        id: q.id,
        text: q.text,
        type: q.type,
        orderIndex: q.orderIndex,
      };

      // For multiple choice, show answers without isCorrect flag
      if (q.type === QuestionType.MULTIPLE_CHOICE) {
        base.answers = q.answers.map((a) => ({
          id: a.id,
          text: a.text,
        }));
      }
      // For text_input, no answers shown

      return base;
    });

    return { quiz, questions: sanitizedQuestions };
  }

  async submitQuiz(
    quizId: string,
    userId: string,
    submitQuizDto: SubmitQuizDto,
  ): Promise<{
    score: number;
    totalQuestions: number;
    correctAnswers: number;
    percentage: number;
    passed: boolean;
    message: string;
    xpEarned: number;
    totalXp: number;
    streak: number;
  }> {
    const quiz = await this.quizzesRepository.findOne({
      where: { id: quizId },
    });
    if (!quiz) {
      throw new NotFoundException('Quiz not found');
    }

    // Check if lesson is unlocked
    const lesson = await this.lessonsService.findOne(quiz.lessonId, userId);
    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }
    if (!lesson.isUnlocked) {
      throw new ForbiddenException('This lesson is locked. Complete the previous lesson first.');
    }

    const questions = await this.questionsRepository.find({
      where: { quizId: quiz.id },
      relations: ['answers'],
    });

    if (questions.length === 0) {
      throw new NotFoundException('No questions found for this quiz');
    }

    let correctCount = 0;

    for (const question of questions) {
      const userAnswer = submitQuizDto.answers.find(
        (a) => a.questionId === question.id,
      );

      if (!userAnswer) {
        continue; // Unanswered = wrong
      }

      if (question.type === QuestionType.MULTIPLE_CHOICE) {
        // For multiple choice, answer should be the answer ID
        const correctAnswer = question.answers.find((a) => a.isCorrect);
        if (correctAnswer && userAnswer.answer === correctAnswer.id) {
          correctCount++;
        }
      } else if (question.type === QuestionType.TEXT_INPUT) {
        // For text input, compare case-insensitive
        const correctAnswer = question.answers.find((a) => a.isCorrect);
        if (
          correctAnswer &&
          userAnswer.answer.trim().toLowerCase() ===
            correctAnswer.text.trim().toLowerCase()
        ) {
          correctCount++;
        }
      }
    }

    const percentage = Math.round((correctCount / questions.length) * 100);
    const passed = percentage >= quiz.passingScore;

    // If passed, complete the lesson
    let xpEarned = 0;
    let totalXp = 0;
    let streak = 0;

    if (passed) {
      const result = await this.lessonsService.completeLesson(
        quiz.lessonId,
        userId,
        percentage,
      );
      xpEarned = result.xpEarned;
      totalXp = result.totalXp;
      streak = result.streak;
    }

    return {
      score: correctCount,
      totalQuestions: questions.length,
      correctAnswers: correctCount,
      percentage,
      passed,
      message: passed
        ? `Congratulations! You passed with ${percentage}%!`
        : `You scored ${percentage}%. You need at least ${quiz.passingScore}% to pass. Try again!`,
      xpEarned,
      totalXp,
      streak,
    };
  }
}
