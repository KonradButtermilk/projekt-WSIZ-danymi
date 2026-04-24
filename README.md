# LinguaLearn API

A production-grade language learning REST API and single-page web app built with NestJS, TypeScript, Vanilla JS, and PostgreSQL (Supabase).

## Features

- **Authentication**: JWT-based register/login with bcrypt password hashing
- **Courses**: Browse language courses with CEFR levels (A1, A2, B1, etc.)
- **Sequential Lessons**: Ordered lessons that unlock progressively
- **Quizzes**: Multiple choice and text input questions with auto-scoring
- **XP System**: Earn +10 XP per completed lesson
- **Streak Tracking**: Daily activity tracking with streak maintenance
- **Full Swagger/OpenAPI**: Interactive documentation at `/api/docs`

## Tech Stack

| Technology | Purpose |
|---|---|
| NestJS | Framework |
| TypeScript | Type safety |
| TypeORM | PostgreSQL ORM |
| PostgreSQL | Database (via Supabase) |
| Passport + JWT | Authentication |
| bcrypt | Password hashing |
| class-validator | DTO validation |
| @nestjs/swagger | OpenAPI docs |

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and fill in your Supabase PostgreSQL connection string:

```bash
cp .env.example .env
```

Edit `.env`:
```
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres
JWT_SECRET=your-super-secret-jwt-key
PORT=3000
```

### 3. Run the Application

```bash
# Development mode (with hot-reload)
npm run start:dev

# Production mode
npm run build
npm run start:prod
```

### 4. Access Swagger Docs

Open your browser at: **http://localhost:3000/api/docs**

## API Endpoints

### Auth (`/api/auth`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login, returns JWT |
| GET | `/api/auth/profile` | ✅ | Get current user |

### Users (`/api/users`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/users/me` | ✅ | Get profile |
| PATCH | `/api/users/me` | ✅ | Update username |
| GET | `/api/users/me/stats` | ✅ | Get XP, streak, stats |

### Courses (`/api/courses`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/courses` | ✅ | List all courses |
| GET | `/api/courses/:id` | ✅ | Get course details |
| POST | `/api/courses` | ✅ | Create course |
| GET | `/api/courses/:id/lessons` | ✅ | List lessons with unlock status |

### Lessons (`/api/lessons`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/lessons/:id` | ✅ | Get lesson details |
| POST | `/api/lessons/:id/complete` | ✅ | Mark lesson complete |

### Quizzes (`/api/quizzes`)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/api/quizzes/lesson/:lessonId` | ✅ | Get quiz for lesson |
| POST | `/api/quizzes/:id/submit` | ✅ | Submit quiz answers |

## Business Logic

### Sequential Lesson Unlocking
- Lessons are ordered by `orderIndex` within each course
- First lesson is always unlocked
- Subsequent lessons unlock only after completing the previous one
- Attempting to access a locked lesson returns `403 Forbidden`

### Quiz Scoring
- Submit answers as an array of `{ questionId, answer }`
- For **multiple_choice**: `answer` = answer UUID
- For **text_input**: `answer` = typed text (case-insensitive matching)
- Minimum pass score: **60%**
- On pass: lesson marked complete, XP awarded, streak updated

### XP System
- +10 XP per first-time lesson completion
- Reattempts don't award additional XP

### Streak System
- Active daily → streak increments
- Same day activity → no change
- Gap of 2+ days → streak resets to 1

## Seed Data

The application auto-seeds on first start:

- **Demo user**: `demo@example.com` / `demo1234`
- **2 courses**: English for Beginners (A1), German Basics (A1)
- **5 lessons per course** with quizzes
- **Mix of question types**: multiple choice + text input

## Database Schema

See `schema.sql` for the full PostgreSQL schema.

## Project Structure

```
src/
├── main.ts                 # Bootstrap + Swagger
├── app.module.ts           # Root module
├── auth/                   # Authentication
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── dto/
│   └── strategies/
├── users/                  # User management
│   ├── users.module.ts
│   ├── users.controller.ts
│   ├── users.service.ts
│   ├── dto/
│   └── entities/
├── courses/                # Course management
│   ├── courses.module.ts
│   ├── courses.controller.ts
│   ├── courses.service.ts
│   ├── dto/
│   └── entities/
├── lessons/                # Lesson management
│   ├── lessons.module.ts
│   ├── lessons.controller.ts
│   ├── lessons.service.ts
│   └── entities/
├── quizzes/                # Quiz system
│   ├── quizzes.module.ts
│   ├── quizzes.controller.ts
│   ├── quizzes.service.ts
│   ├── dto/
│   └── entities/
├── common/                 # Shared utilities
│   ├── guards/
│   └── decorators/
└── seed/                   # Database seeding
    ├── seed.module.ts
    └── seed.service.ts
```
