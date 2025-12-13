import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminStudentsController } from './students.controller';
import { AdminStudentsService } from './students.service';
import { Student } from '../../students/entities/student.entity';
import { ClassEntity } from '../../classes/entities/class.entity';
import { School } from '../../schools/entities/school.entity';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forFeature([Student, ClassEntity, School]),
  ],
  controllers: [AdminStudentsController],
  providers: [AdminStudentsService],
  exports: [AdminStudentsService],
})
export class AdminStudentsModule {}
