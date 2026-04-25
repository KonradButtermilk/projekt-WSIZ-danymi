import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual, Not, IsNull } from 'typeorm';
import { Flashcard } from './entities/flashcard.entity';
import { User } from '../users/entities/user.entity';
import { CreateFlashcardDto } from './dto/create-flashcard.dto';
import { ReviewFlashcardDto } from './dto/review-flashcard.dto';

@Injectable()
export class FlashcardsService {
  constructor(
    @InjectRepository(Flashcard)
    private flashcardRepository: Repository<Flashcard>,
  ) {}

  async create(user: User, createFlashcardDto: CreateFlashcardDto) {
    if (createFlashcardDto.mnemonic || createFlashcardDto.palaceLocation) {
      if (!user.isPro) {
        const customCardsCount = await this.flashcardRepository.count({
          where: [
            { user: { id: user.id }, mnemonic: Not(IsNull()) },
            { user: { id: user.id }, palaceLocation: Not(IsNull()) }
          ]
        });
        if (customCardsCount >= 5) {
          throw new ForbiddenException('Free users can only create up to 5 Memory Palace hints. Upgrade to Pro for unlimited!');
        }
      }
    }

    const flashcard = this.flashcardRepository.create({
      ...createFlashcardDto,
      user,
    });
    return this.flashcardRepository.save(flashcard);
  }

  async getDueCards(userId: string) {
    const now = new Date();
    return this.flashcardRepository.find({
      where: {
        user: { id: userId },
        nextReview: LessThanOrEqual(now),
      },
      order: { nextReview: 'ASC' },
    });
  }

  async reviewCard(id: string, userId: string, reviewDto: ReviewFlashcardDto) {
    const card = await this.flashcardRepository.findOne({
      where: { id, user: { id: userId } },
    });

    if (!card) throw new NotFoundException('Flashcard not found');

    // SuperMemo-2 (SM-2) algorithm simplified
    let { interval, easeFactor } = card;
    const { quality } = reviewDto;

    if (quality >= 3) {
      if (interval === 0) {
        interval = 1;
      } else if (interval === 1) {
        interval = 6;
      } else {
        interval = Math.round(interval * easeFactor);
      }
    } else {
      interval = 0; // reset
    }

    easeFactor = easeFactor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
    if (easeFactor < 1.3) easeFactor = 1.3;

    const nextReview = new Date();
    nextReview.setDate(nextReview.getDate() + interval);

    card.interval = interval;
    card.easeFactor = easeFactor;
    card.nextReview = nextReview;

    return this.flashcardRepository.save(card);
  }

  async findAll(userId: string) {
    return this.flashcardRepository.find({
      where: { user: { id: userId } },
      order: { createdAt: 'DESC' },
    });
  }

  async remove(id: string, userId: string) {
    const card = await this.flashcardRepository.findOne({
      where: { id, user: { id: userId } },
    });
    if (!card) throw new NotFoundException('Flashcard not found');
    return this.flashcardRepository.remove(card);
  }
}
