import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from '../users/entities/user.entity';
import { ClassTeacherAssignment } from '../admin/classes/entities/class-teacher-assignment.entity';
import { TeacherProfile } from '../admin/entities/teacher-profile.entity';

@Injectable()
export class ClassTeacherGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(TeacherProfile)
    private teacherProfileRepo: Repository<TeacherProfile>,
    @InjectRepository(ClassTeacherAssignment)
    private classAssignRepo: Repository<ClassTeacherAssignment>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const auth = req.headers.authorization;
    if (!auth || !auth.startsWith('Bearer '))
      throw new UnauthorizedException('Missing token');
    const token = auth.split(' ')[1];
    try {
      const payload = this.jwtService.verify(token, {
        secret: process.env.ACCESS_TOKEN_SECRET ?? 'access-secret',
      }) as unknown as { sub: string };

      const user = await this.userRepo.findOne({ where: { id: payload.sub } });
      if (!user) throw new UnauthorizedException('Invalid token');

      if (user.role === UserRole.ADMIN) return true;

      if (user.role !== UserRole.TEACHER)
        throw new UnauthorizedException('Not authorized');

      const body = req.body as { classId?: string };
      const classId = body?.classId || req.params?.classId;
      if (!classId) throw new BadRequestException('classId required');

      const teacherProfile = await this.teacherProfileRepo.findOne({
        where: { user: { id: user.id } },
      });
      if (!teacherProfile)
        throw new UnauthorizedException('Teacher profile not found');

      const assignment = await this.classAssignRepo.findOne({
        where: { classId, teacherId: teacherProfile.id, isClassTeacher: true },
      });
      if (!assignment)
        throw new UnauthorizedException(
          'Teacher is not class teacher for this class',
        );

      (req as Request & { user?: User }).user = user;
      return true;
    } catch (err) {
      if (
        err instanceof UnauthorizedException ||
        err instanceof BadRequestException
      )
        throw err;
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
