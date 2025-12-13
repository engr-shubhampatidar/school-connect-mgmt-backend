import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminAnnouncementsController } from './announcements.controller';
import { AdminAnnouncementsService } from './announcements.service';
import { Announcement } from '../../announcements/entities/announcement.entity';
import { ClassEntity } from '../../classes/entities/class.entity';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([Announcement, ClassEntity])],
  controllers: [AdminAnnouncementsController],
  providers: [AdminAnnouncementsService],
})
export class AdminAnnouncementsModule {}
