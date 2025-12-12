import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AdminClassesController } from './classes.controller';
import { AdminClassesService } from './classes.service';
import { ClassEntity } from '../../classes/entities/class.entity';
import { School } from '../../schools/entities/school.entity';
import { TeacherProfile } from '../teachers/entities/teacher-profile.entity';
import { User } from '../../users/entities/user.entity';
import { AdminGuard } from '../admin.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET ?? 'access-secret',
    }),
    TypeOrmModule.forFeature([ClassEntity, School, TeacherProfile, User]),
  ],
  controllers: [AdminClassesController],
  providers: [AdminClassesService, AdminGuard],
  exports: [AdminClassesService],
})
export class AdminClassesModule {}
