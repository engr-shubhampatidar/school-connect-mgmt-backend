import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminGuard } from '../admin/admin.guard';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET ?? 'access-secret',
    }),
    TypeOrmModule.forFeature([User]),
  ],
  providers: [AdminGuard],
  exports: [AdminGuard, JwtModule],
})
export class AuthModule {}
