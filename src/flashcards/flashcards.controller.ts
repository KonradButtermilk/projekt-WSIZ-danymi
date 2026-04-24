import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { FlashcardsService } from './flashcards.service';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { ReviewFlashcardDto } from './dto/review-flashcard.dto';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../users/entities/user.entity';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('Flashcards')
@ApiBearerAuth('bearer')
@UseGuards(JwtAuthGuard)
@Controller('flashcards')
export class FlashcardsController {
  constructor(private readonly flashcardsService: FlashcardsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new flashcard' })
  @ApiResponse({ status: 201, description: 'Flashcard created successfully.' })
  create(@CurrentUser() user: User, @Body() createFlashcardDto: CreateFlashcardDto) {
    return this.flashcardsService.create(user, createFlashcardDto);
  }

  @Get('due')
  @ApiOperation({ summary: 'Get flashcards due for review' })
  @ApiResponse({ status: 200, description: 'List of due flashcards.' })
  getDueCards(@CurrentUser() user: User) {
    return this.flashcardsService.getDueCards(user.id);
  }

  @Post(':id/review')
  @ApiOperation({ summary: 'Submit a review for a flashcard' })
  @ApiResponse({ status: 200, description: 'Flashcard updated.' })
  reviewCard(
    @Param('id') id: string,
    @CurrentUser() user: User,
    @Body() reviewDto: ReviewFlashcardDto,
  ) {
    return this.flashcardsService.reviewCard(id, user.id, reviewDto);
  }
}
