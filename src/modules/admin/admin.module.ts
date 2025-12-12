import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminGuard } from './admin.guard';
import { User } from '../users/entities/user.entity';
import { School } from '../schools/entities/school.entity';
import { Student } from '../students/entities/student.entity';
import { ClassEntity } from '../classes/entities/class.entity';
import { TeacherProfile } from './entities/teacher-profile.entity';
import { Subject } from './entities/subject.entity';
import { AdminTeachersService } from './teachers/teachers.service';
import { AdminTeachersController } from './teachers/teachers.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET ?? 'access-secret',
    }),
    TypeOrmModule.forFeature([
      User,
      School,
      Student,
      ClassEntity,
      TeacherProfile,
      Subject,
    ]),
  ],
  controllers: [AdminController, AdminTeachersController],
  providers: [AdminService, AdminGuard, AdminTeachersService],
  exports: [AdminService],
})
export class AdminModule {}
