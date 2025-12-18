import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { TeacherClassService } from './teacher.service';
import { TeacherAuthGuard } from '../auth/teacher-auth.guard';
import { User } from '../users/entities/user.entity';

@Controller('api/teacher')
export class TeacherClassController {
  constructor(private readonly svc: TeacherClassService) {}

  @UseGuards(TeacherAuthGuard)
  @Get('class')
  async getClass(@Req() req: Request & { user: User }) {
    return this.svc.getClassForTeacher(req.user);
  }
}
