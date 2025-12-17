import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Attendance } from './entities/attendance.entity';
import { AttendanceStudent } from './entities/attendance-student.entity';
import { AttendanceService } from './attendance.service';
import { AttendanceController } from './attendance.controller';
import { AttachUserGuard } from './guards/attach-user.guard';
import { CreateAttendanceGuard } from './guards/create-attendance.guard';
import { User } from '../users/entities/user.entity';
import { Student } from '../students/entities/student.entity';
import { TeacherProfile } from '../admin/entities/teacher-profile.entity';
import { ClassTeacherAssignment } from '../admin/classes/entities/class-teacher-assignment.entity';
import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Attendance,
      AttendanceStudent,
      User,
      Student,
      TeacherProfile,
      ClassTeacherAssignment,
    ]),
  ],
  controllers: [AttendanceController],
  providers: [
    AttendanceService,
    AttachUserGuard,
    CreateAttendanceGuard,
    JwtService,
  ],
  exports: [AttendanceService],
})
export class AttendanceModule {}
