import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';

@Injectable()
export class LeaderboardService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async getTopUsers(limit: number = 10) {
    return this.userRepository.find({
      order: { xp: 'DESC' },
      take: limit,
      select: ['id', 'username', 'xp', 'streak'], // only select public info
    });
  }
}
