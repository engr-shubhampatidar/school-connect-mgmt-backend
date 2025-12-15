import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSubjectsController } from './subjects.controller';
import { AdminSubjectsService } from './subjects.service';
import { Subject } from '../entities/subject.entity';
import { TeacherProfile } from '../entities/teacher-profile.entity';
import { ClassTeacherAssignment } from '../classes/entities/class-teacher-assignment.entity';
import { School } from '../../schools/entities/school.entity';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      Subject,
      TeacherProfile,
      ClassTeacherAssignment,
      School,
    ]),
  ],
  controllers: [AdminSubjectsController],
  providers: [AdminSubjectsService],
})
export class AdminSubjectsModule {}
