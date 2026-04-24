import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ access_token: string; user: Partial<User> }> {
    const existingEmail = await this.usersRepository.findOne({
      where: { email: registerDto.email },
    });
    if (existingEmail) {
      throw new ConflictException('Email already registered');
    }

    const existingUsername = await this.usersRepository.findOne({
      where: { username: registerDto.username },
    });
    if (existingUsername) {
      throw new ConflictException('Username already taken');
    }

    const passwordHash = await bcrypt.hash(registerDto.password, 10);

    const user = this.usersRepository.create({
      email: registerDto.email,
      username: registerDto.username,
      passwordHash,
    });

    const savedUser = await this.usersRepository.save(user);

    const payload = { sub: savedUser.id, email: savedUser.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: savedUser.id,
        email: savedUser.email,
        username: savedUser.username,
        xp: savedUser.xp,
        streak: savedUser.streak,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<{ access_token: string; user: Partial<User> }> {
    const user = await this.usersRepository.findOne({
      where: { email: loginDto.email },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: user.id, email: user.email };
    const access_token = this.jwtService.sign(payload);

    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        xp: user.xp,
        streak: user.streak,
      },
    };
  }

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const { passwordHash, ...result } = user;
    return result;
  }
}
