import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';
import type { Secret, JwtPayload } from 'jsonwebtoken';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { School } from '../schools/entities/school.entity';
import { Student } from '../students/entities/student.entity';
import { ClassEntity } from '../classes/entities/class.entity';

@Injectable()
export class AdminService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(School)
    private schoolRepo: Repository<School>,
    @InjectRepository(Student)
    private studentRepo: Repository<Student>,
    @InjectRepository(ClassEntity)
    private classRepo: Repository<ClassEntity>,
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
    const payload = { sub: user.id };
    const secret: Secret = process.env.REFRESH_TOKEN_SECRET ?? 'refresh-secret';
    const expiresIn = process.env.REFRESH_TOKEN_EXPIRES ?? '7d';
    const payloadObj = payload as unknown as JwtPayload;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    return jwt.sign(payloadObj as any, secret as any, { expiresIn } as any);
  }

  async validateCredentials(email: string, password: string) {
    const user = await this.userRepo.findOne({
      where: { email },
      relations: ['school'],
    });
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) throw new UnauthorizedException('Invalid credentials');

    if (!user.school || user.school.provisioningStatus !== 'active') {
      throw new BadRequestException('School not found or inactive');
    }

    if (user.role !== 'admin') {
      throw new UnauthorizedException('Not an admin user');
    }

    return user;
  }

  login(user: User) {
    const accessToken = this.createAccessToken(user);
    const refreshToken = this.createRefreshToken(user);
    const safeUser = {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
      school: user.school,
    };
    return { accessToken, refreshToken, user: safeUser };
  }

  async refresh(refreshToken: string) {
    try {
      const secret = process.env.REFRESH_TOKEN_SECRET ?? 'refresh-secret';
      const payload = jwt.verify(refreshToken, secret) as { sub: string };
      const user = await this.userRepo.findOne({
        where: { id: payload.sub },
        relations: ['school'],
      });
      if (!user) throw new UnauthorizedException('Invalid refresh token');

      // issue new tokens
      return this.login(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getDashboard(schoolId: string | null) {
    if (!schoolId) return { message: 'no school context' };
    const totalStudents = await this.studentRepo
      .createQueryBuilder('s')
      .where('s.schoolId = :schoolId', { schoolId })
      .getCount();

    const totalClasses = await this.classRepo
      .createQueryBuilder('c')
      .where('c.schoolId = :schoolId', { schoolId })
      .getCount();

    const totalTeachers = await this.userRepo
      .createQueryBuilder('u')
      .where('u.schoolId = :schoolId', { schoolId })
      .andWhere('u.role = :role', { role: 'teacher' })
      .getCount();

    const recentStudents = await this.studentRepo
      .createQueryBuilder('s')
      .where('s.schoolId = :schoolId', { schoolId })
      .orderBy('s.createdAt', 'DESC')
      .limit(5)
      .getMany();

    return {
      schoolId,
      totalStudents,
      totalClasses,
      totalTeachers,
      recentStudents,
    };
  }
}
