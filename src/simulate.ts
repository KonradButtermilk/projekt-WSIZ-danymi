import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { UsersService } from './users/users.service';
import { AuthService } from './auth/auth.service';
import { LessonsService } from './lessons/lessons.service';
import { FlashcardsService } from './flashcards/flashcards.service';
import { QuizzesService } from './quizzes/quizzes.service';
import { CoursesService } from './courses/courses.service';
import { InjectRepository, getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users/entities/user.entity';
import { AchievementsService } from './achievements/achievements.service';

async function bootstrap() {
  console.log('Starting simulation...');
  const app = await NestFactory.createApplicationContext(AppModule);

  const authService = app.get(AuthService);
  const usersService = app.get(UsersService);
  const lessonsService = app.get(LessonsService);
  const coursesService = app.get(CoursesService);
  const quizzesService = app.get(QuizzesService);
  const flashcardsService = app.get(FlashcardsService);
  const achievementsService = app.get(AchievementsService);

  const usersCount = 20;

  console.log(`Generating ${usersCount} users...`);

  const courses = await coursesService.findAll();
  if (courses.length === 0) {
    console.error('No courses found! Ensure DB is seeded first.');
    await app.close();
    return;
  }

  for (let i = 0; i < usersCount; i++) {
    const username = `Student_${Math.floor(Math.random() * 10000)}_${i}`;
    const email = `student${Math.random()}@lingualearn.com`;
    const password = 'password123';

    try {
      const { user } = await authService.register({ username, email, password });
      console.log(`Created user: ${user.username}`);

      if (!user.id) continue;

      // Randomize Pro status
      if (Math.random() > 0.7) {
        await usersService.upgradeToPro(user.id);
      }

      // Randomize XP and Streak - including whales!
      const isWhale = Math.random() > 0.85;
      const randomStreak = isWhale ? Math.floor(Math.random() * 200) + 100 : Math.floor(Math.random() * 30); // Whales up to 300
      
      const userRepo = app.get(getRepositoryToken(User)) as Repository<User>;
      if (userRepo) {
        await userRepo.update({ id: user.id }, {
           streak: randomStreak,
           lastActiveDate: new Date().toISOString().split('T')[0],
           xp: isWhale ? Math.floor(Math.random() * 50000) + 5000 : 0
        });
      }

      // Complete random number of lessons
      const numLessonsToComplete = Math.floor(Math.random() * 5); // 0 to 4
      for (const course of courses) {
        const lessons = await coursesService.getCourseLessons(course.id, user.id);
        for (let j = 0; j < Math.min(numLessonsToComplete, lessons.length); j++) {
          const lesson = lessons[j];
          // submit dummy quiz
          const quizData = await quizzesService.findByLessonId(lesson.id, user.id);
          const answers = quizData.questions.map(q => ({
            questionId: q.id,
            answer: q.type === 'multiple_choice' && q.answers ? q.answers[0].id : 'dummy',
          }));
          
          await quizzesService.submitQuiz(quizData.quiz.id, user.id, { answers });
        }
      }

      // Add random flashcards
      const numCards = Math.floor(Math.random() * 10);
      for (let k = 0; k < numCards; k++) {
        await flashcardsService.create(user as any, {
          front: `Word ${k} for ${user.username}`,
          back: `Translation ${k}`,
          mnemonic: k % 2 === 0 ? 'A mnemonic here' : undefined,
          palaceLocation: k % 3 === 0 ? 'Living Room' : undefined,
        });
      }

      // Trigger achievement check
      await achievementsService.checkAndAwardAchievements(user.id);
      
      console.log(`User ${user.username} simulation completed.`);
    } catch (e: any) {
      console.error(`Failed to simulate user ${username}:`, e.message);
    }
  }

  console.log('Simulation complete!');
  await app.close();
}

bootstrap();
