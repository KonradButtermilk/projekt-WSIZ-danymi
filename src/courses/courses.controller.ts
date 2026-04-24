import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
  ApiParam,
} from '@nestjs/swagger';
import { CoursesService } from './courses.service';
import { CreateCourseDto } from './dto/create-course.dto';
import { Course } from './entities/course.entity';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';

@ApiTags('Courses')
@Controller('courses')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('bearer')
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all available courses' })
  @ApiResponse({
    status: 200,
    description: 'List of all courses',
    type: [Course],
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async findAll() {
    return this.coursesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific course by ID' })
  @ApiParam({ name: 'id', description: 'Course UUID' })
  @ApiResponse({
    status: 200,
    description: 'Course details',
    type: Course,
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.coursesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new course' })
  @ApiBody({ type: CreateCourseDto })
  @ApiResponse({
    status: 201,
    description: 'Course created successfully',
    type: Course,
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async create(@Body() createCourseDto: CreateCourseDto) {
    return this.coursesService.create(createCourseDto);
  }

  @Get(':id/lessons')
  @ApiOperation({ summary: 'Get all lessons for a course with unlock status' })
  @ApiParam({ name: 'id', description: 'Course UUID' })
  @ApiResponse({
    status: 200,
    description: 'List of lessons with unlock/completion status',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          description: { type: 'string' },
          orderIndex: { type: 'number' },
          isUnlocked: { type: 'boolean' },
          isCompleted: { type: 'boolean' },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 404, description: 'Course not found' })
  async getCourseLessons(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.coursesService.getCourseLessons(id, user.id);
  }
}
