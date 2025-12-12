import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AdminSettingsController } from './settings.controller';
import { AdminSettingsService } from './settings.service';
import { School } from '../../schools/entities/school.entity';
import { User } from '../../users/entities/user.entity';
import { AdminGuard } from '../admin.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET ?? 'access-secret',
    }),
    TypeOrmModule.forFeature([School, User]),
  ],
  controllers: [AdminSettingsController],
  providers: [AdminSettingsService, AdminGuard],
  exports: [AdminSettingsService],
})
export class AdminSettingsModule {}
