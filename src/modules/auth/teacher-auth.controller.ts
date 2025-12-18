/* eslint-disable @typescript-eslint/no-unsafe-argument */
import {
  Body,
  Controller,
  Post,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as jwt from 'jsonwebtoken';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { TeacherProfile } from '../admin/entities/teacher-profile.entity';
import { ApiTags, ApiOperation, ApiBody, ApiResponse } from '@nestjs/swagger';
import { LoginDto } from '../admin/dto/login.dto';

@Controller('api/teacher')
@ApiTags('Teacher Auth')
export class TeacherAuthController {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(TeacherProfile)
    private teacherRepo: Repository<TeacherProfile>,
  ) {}

  private createAccessToken(user: User) {
    const payload = {
      sub: user.id,
      role: user.role,
      schoolId: user.school?.id,
    };
    return this.jwtService.sign(payload);
  }

  private createRefreshToken(user: User) {
    const payload = { sub: user.id } as unknown as jwt.JwtPayload;
    const secret = process.env.REFRESH_TOKEN_SECRET ?? 'refresh-secret';
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRES ?? '7d';

    return jwt.sign(payload as any, secret as any, { expiresIn } as any);
  }

  @Post('auth/login')
  @ApiOperation({ summary: 'Teacher login (email + password)' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ status: 200, description: 'JWT tokens and teacher profile' })
  async login(@Body() dto: LoginDto) {
    const user = await this.userRepo.findOne({
      where: { email: dto.email },
      relations: ['school'],
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');
    if (!user.passwordHash)
      throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    if (!user.school || user.school.provisioningStatus !== 'active')
      throw new BadRequestException('School not found or inactive');

    if (user.role !== UserRole.TEACHER)
      throw new UnauthorizedException('Not a teacher user');

    // load teacher profile
    const profile = await this.teacherRepo.findOne({
      where: { user: { id: user.id } },
      relations: ['school', 'subjects', 'user'],
    });

    const accessToken = this.createAccessToken(user);
    const refreshToken = this.createRefreshToken(user);

    const safeUser = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      school: user.school,
    };

    return {
      accessToken,
      refreshToken,
      user: safeUser,
      teacherProfile: profile,
    };
  }
}
