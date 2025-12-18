import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClassTeacherAssignment } from '../admin/classes/entities/class-teacher-assignment.entity';
import { ClassEntity } from '../classes/entities/class.entity';
import { Student } from '../students/entities/student.entity';
import { TeacherProfile } from '../admin/entities/teacher-profile.entity';
import { AuthModule } from '../auth/auth.module';
import { TeacherClassController } from './teacher.controller';
import { TeacherClassService } from './teacher.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      ClassTeacherAssignment,
      ClassEntity,
      Student,
      TeacherProfile,
    ]),
    AuthModule,
  ],
  controllers: [TeacherClassController],
  providers: [TeacherClassService],
})
export class TeacherModule {}
