import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
// AdminGuard and User repository are provided via AuthModule
import { School } from '../schools/entities/school.entity';
import { Student } from '../students/entities/student.entity';
import { ClassEntity } from '../classes/entities/class.entity';
import { TeacherProfile } from './entities/teacher-profile.entity';
import { Subject } from './entities/subject.entity';
import { ClassTeacherAssignment } from './classes/entities/class-teacher-assignment.entity';
import { AdminTeachersService } from './teachers/teachers.service';
import { AdminTeachersController } from './teachers/teachers.controller';
import { AdminStudentsModule } from './students/students.module';
import { AdminClassesModule } from './classes/classes.module';
import { AdminSettingsModule } from './settings/settings.module';
import { AdminAnnouncementsModule } from './announcements/announcements.module';
import { AdminSubjectsModule } from './subjects/subjects.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      School,
      Student,
      ClassEntity,
      TeacherProfile,
      Subject,
      ClassTeacherAssignment,
      // include assignment entity so admin teachers service can inject it
      // note: defined in admin/classes/entities
      // import dynamically below
    ]),
    AdminStudentsModule,
    AdminClassesModule,
    AdminSettingsModule,
    AdminSubjectsModule,
    AdminAnnouncementsModule,
  ],
  controllers: [AdminController, AdminTeachersController],
  providers: [AdminService, AdminTeachersService],
  exports: [AdminService],
})
export class AdminModule {}
