import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminGuard } from '../admin/admin.guard';
import { User } from '../users/entities/user.entity';
import { TeacherProfile } from '../admin/entities/teacher-profile.entity';
import { TeacherAuthGuard } from './teacher-auth.guard';
import { TeacherAuthController } from './teacher-auth.controller';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET ?? 'access-secret',
    }),
    TypeOrmModule.forFeature([User, TeacherProfile]),
  ],
  controllers: [TeacherAuthController],
  providers: [AdminGuard, TeacherAuthGuard],
  exports: [AdminGuard, TeacherAuthGuard, JwtModule, TypeOrmModule],
})
export class AuthModule {}
