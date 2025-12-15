import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminClassesController } from './classes.controller';
import { AdminClassesService } from './classes.service';
import { ClassEntity } from '../../classes/entities/class.entity';
import { School } from '../../schools/entities/school.entity';
import { TeacherProfile } from '../entities/teacher-profile.entity';
import { Subject } from '../entities/subject.entity';
import { ClassTeacherAssignment } from './entities/class-teacher-assignment.entity';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([
      ClassEntity,
      School,
      TeacherProfile,
      Subject,
      ClassTeacherAssignment,
    ]),
  ],
  controllers: [AdminClassesController],
  providers: [AdminClassesService],
  exports: [AdminClassesService],
})
export class AdminClassesModule {}
