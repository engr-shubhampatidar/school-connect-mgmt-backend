import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { School } from '../../schools/entities/school.entity';
import { UpdateSettingsDto } from './dto/update-settings.dto';

@Injectable()
export class AdminSettingsService {
  private readonly logger = new Logger(AdminSettingsService.name);

  constructor(
    @InjectRepository(School)
    private schoolRepo: Repository<School>,
  ) {}

  async getSettings(schoolId: string) {
    if (!schoolId) throw new BadRequestException('Missing school context');
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (!school) throw new BadRequestException('School not found');

    // Return settings with sensible defaults
    const defaults = {
      academicYear: new Date().getFullYear().toString(),
      timezone: 'UTC',
      notificationPreferences: { email: true, sms: false },
      schoolLogoUrl: school.logoUrl ?? null,
    } as const;

    return {
      academicYear: school.academicYear ?? defaults.academicYear,
      timezone: school.timezone ?? defaults.timezone,
      notificationPreferences:
        school.notificationPreferences ?? defaults.notificationPreferences,
      schoolLogoUrl: school.logoUrl ?? undefined,
    };
  }

  async updateSettings(schoolId: string, dto: UpdateSettingsDto) {
    if (!schoolId) throw new BadRequestException('Missing school context');
    const school = await this.schoolRepo.findOne({ where: { id: schoolId } });
    if (!school) throw new BadRequestException('School not found');

    if (dto.academicYear !== undefined) school.academicYear = dto.academicYear;
    if (dto.timezone !== undefined) school.timezone = dto.timezone;
    if (dto.notificationPreferences !== undefined)
      school.notificationPreferences = dto.notificationPreferences;
    if (dto.schoolLogoUrl !== undefined) school.logoUrl = dto.schoolLogoUrl;

    const saved = await this.schoolRepo.save(school);
    this.logger.log(`Settings updated for school ${schoolId}`);
    return {
      academicYear: saved.academicYear ?? undefined,
      timezone: saved.timezone ?? undefined,
      notificationPreferences: saved.notificationPreferences ?? undefined,
      schoolLogoUrl: saved.logoUrl ?? undefined,
    };
  }
}
