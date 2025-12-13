import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSubjectsController } from './subjects.controller';
import { AdminSubjectsService } from './subjects.service';
import { Subject } from '../entities/subject.entity';
import { TeacherProfile } from '../teachers/entities/teacher-profile.entity';
import { School } from '../../schools/entities/school.entity';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Subject, TeacherProfile, School]),
  ],
  controllers: [AdminSubjectsController],
  providers: [AdminSubjectsService],
})
export class AdminSubjectsModule {}
