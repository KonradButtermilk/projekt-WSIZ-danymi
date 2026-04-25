import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { Progress } from '../lessons/entities/progress.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Progress)
    private readonly progressRepository: Repository<Progress>,
  ) {}

  async findById(id: string): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const { passwordHash, ...result } = user;
    return result as Omit<User, 'passwordHash'>;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'passwordHash'>> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (updateUserDto.username) {
      const existingUsername = await this.usersRepository.findOne({
        where: { username: updateUserDto.username },
      });
      if (existingUsername && existingUsername.id !== id) {
        throw new ConflictException('Username already taken');
      }
      user.username = updateUserDto.username;
    }

    const savedUser = await this.usersRepository.save(user);
    const { passwordHash, ...result } = savedUser;
    return result as Omit<User, 'passwordHash'>;
  }

  async getStats(userId: string): Promise<{
    xp: number;
    streak: number;
    completedLessons: number;
    lastActiveDate: string | null;
  }> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const completedLessons = await this.progressRepository.count({
      where: { userId, completed: true },
    });

    return {
      xp: user.xp,
      streak: user.streak,
      completedLessons,
      lastActiveDate: user.lastActiveDate,
    };
  }

  async upgradeToPro(userId: string, tier: string = 'pro'): Promise<{ message: string, isPro: boolean, proTier: string }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.isPro = true;
    user.proTier = tier;
    await this.usersRepository.save(user);

    const tierName = tier === 'plus' ? 'LinguaLearn Ultra' : 'LinguaLearn Pro';
    return { 
      message: `Successfully upgraded to ${tierName}!`, 
      isPro: true,
      proTier: tier
    };
  }

  async purchaseGems(userId: string, amount: number): Promise<{ message: string, gems: number }> {
    const user = await this.usersRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    user.gems += amount;
    await this.usersRepository.save(user);

    return { message: `Successfully purchased ${amount} gems!`, gems: user.gems };
  }
}
