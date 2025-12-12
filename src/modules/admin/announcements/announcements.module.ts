import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { AdminAnnouncementsController } from './announcements.controller';
import { AdminAnnouncementsService } from './announcements.service';
import { Announcement } from '../../announcements/entities/announcement.entity';
import { ClassEntity } from '../../classes/entities/class.entity';
import { User } from '../../users/entities/user.entity';
import { AdminGuard } from '../admin.guard';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.ACCESS_TOKEN_SECRET ?? 'access-secret',
    }),
    TypeOrmModule.forFeature([Announcement, ClassEntity, User]),
  ],
  controllers: [AdminAnnouncementsController],
  providers: [AdminAnnouncementsService, AdminGuard],
})
export class AdminAnnouncementsModule {}
