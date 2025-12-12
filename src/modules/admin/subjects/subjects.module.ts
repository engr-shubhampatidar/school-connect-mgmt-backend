import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AdminSubjectsController } from './subjects.controller';
import { AdminSubjectsService } from './subjects.service';
import { Subject } from '../entities/subject.entity';
import { TeacherProfile } from '../teachers/entities/teacher-profile.entity';
import { School } from '../../schools/entities/school.entity';
import { User } from '../../users/entities/user.entity';
import { AdminGuard } from '../admin.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET ?? 'access-secret',
    }),
    TypeOrmModule.forFeature([Subject, TeacherProfile, School, User]),
  ],
  controllers: [AdminSubjectsController],
  providers: [AdminSubjectsService, AdminGuard],
})
export class AdminSubjectsModule {}
