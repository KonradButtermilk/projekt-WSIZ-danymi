import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global prefix for API routes
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  // Enable CORS
  app.enableCors();

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('LinguaLearn API')
    .setDescription(
      'LinguaLearn is a language learning platform REST API. ' +
      'Users can register, browse courses, complete lessons sequentially, ' +
      'solve quizzes, earn XP, and maintain daily streaks.',
    )
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter your JWT token',
        in: 'header',
      },
      'bearer',
    )
    .addTag('Auth', 'Authentication endpoints - register, login, profile')
    .addTag('Users', 'User profile and statistics')
    .addTag('Courses', 'Language courses management')
    .addTag('Lessons', 'Lesson management and completion')
    .addTag('Quizzes', 'Quiz retrieval and submission')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.PORT || 3000;
  await app.listen(port);
  console.log(`🚀 LinguaLearn is running on: http://localhost:${port}`);
  console.log(`📚 Swagger docs: http://localhost:${port}/api/docs`);
}
bootstrap();
