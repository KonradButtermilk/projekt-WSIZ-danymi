import {
  Controller,
  Get,
  Patch,
  Post,
  Body,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from './entities/user.entity';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('bearer')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        username: { type: 'string' },
        xp: { type: 'number' },
        streak: { type: 'number' },
        isPro: { type: 'boolean' },
        lastActiveDate: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getProfile(@CurrentUser() user: User) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  @ApiOperation({ summary: 'Update current user profile' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({
    status: 200,
    description: 'Updated user profile',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        username: { type: 'string' },
        xp: { type: 'number' },
        streak: { type: 'number' },
        lastActiveDate: { type: 'string', nullable: true },
        createdAt: { type: 'string', format: 'date-time' },
      },
    },
  })
  @ApiResponse({ status: 400, description: 'Validation error' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  @ApiResponse({ status: 409, description: 'Username already taken' })
  async updateProfile(
    @CurrentUser() user: User,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.usersService.update(user.id, updateUserDto);
  }

  @Get('me/stats')
  @ApiOperation({ summary: 'Get current user statistics' })
  @ApiResponse({
    status: 200,
    description: 'User statistics',
    schema: {
      type: 'object',
      properties: {
        xp: { type: 'number', example: 120 },
        streak: { type: 'number', example: 5 },
        completedLessons: { type: 'number', example: 12 },
        lastActiveDate: { type: 'string', nullable: true },
      },
    },
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async getStats(@CurrentUser() user: User) {
    return this.usersService.getStats(user.id);
  }

  @Post('upgrade')
  @ApiOperation({ summary: 'Upgrade to a specific subscription tier' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        tier: { type: 'string', enum: ['pro', 'plus'], default: 'pro' } 
      } 
    } 
  })
  @ApiResponse({
    status: 200,
    description: 'User successfully upgraded',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async upgradeToPro(
    @CurrentUser() user: User,
    @Body('tier') tier: string = 'pro'
  ) {
    return this.usersService.upgradeToPro(user.id, tier);
  }

  @Post('purchase-gems')
  @ApiOperation({ summary: 'Fake microtransaction: purchase gems' })
  @ApiBody({ 
    schema: { 
      type: 'object', 
      properties: { 
        amount: { type: 'number', example: 500 },
        paymentMethod: { type: 'string', example: 'credit_card' }
      } 
    } 
  })
  @ApiResponse({
    status: 200,
    description: 'Gems successfully purchased',
  })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async purchaseGems(
    @CurrentUser() user: User,
    @Body('amount') amount: number
  ) {
    return this.usersService.purchaseGems(user.id, amount);
  }
}
