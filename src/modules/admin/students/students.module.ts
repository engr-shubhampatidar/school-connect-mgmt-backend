import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AdminStudentsController } from './students.controller';
import { AdminStudentsService } from './students.service';
import { Student } from '../../students/entities/student.entity';
import { ClassEntity } from '../../classes/entities/class.entity';
import { School } from '../../schools/entities/school.entity';
import { User } from '../../users/entities/user.entity';
import { AdminGuard } from '../admin.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET ?? 'access-secret',
    }),
    TypeOrmModule.forFeature([Student, ClassEntity, School, User]),
  ],
  controllers: [AdminStudentsController],
  providers: [AdminStudentsService, AdminGuard],
  exports: [AdminStudentsService],
})
export class AdminStudentsModule {}
