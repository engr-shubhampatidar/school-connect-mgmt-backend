import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminSettingsController } from './settings.controller';
import { AdminSettingsService } from './settings.service';
import { School } from '../../schools/entities/school.entity';
import { AuthModule } from '../../auth/auth.module';

@Module({
  imports: [AuthModule, TypeOrmModule.forFeature([School])],
  controllers: [AdminSettingsController],
  providers: [AdminSettingsService],
  exports: [AdminSettingsService],
})
export class AdminSettingsModule {}
