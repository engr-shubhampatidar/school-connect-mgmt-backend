import { ApiPropertyOptional } from '@nestjs/swagger';

export class SettingsResponseDto {
  @ApiPropertyOptional({ description: "School's academic year" })
  academicYear?: string;

  @ApiPropertyOptional({ description: 'Timezone identifier' })
  timezone?: string;

  @ApiPropertyOptional({ description: 'Notification preferences object' })
  notificationPreferences?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'School logo URL' })
  schoolLogoUrl?: string;
}
