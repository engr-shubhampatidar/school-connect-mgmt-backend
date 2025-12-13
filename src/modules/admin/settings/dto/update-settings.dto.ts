import { IsOptional, IsString, IsObject, IsUrl } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ description: "School's academic year" })
  @IsOptional()
  @IsString()
  academicYear?: string;

  @ApiPropertyOptional({ description: 'Timezone identifier' })
  @IsOptional()
  @IsString()
  timezone?: string;

  @ApiPropertyOptional({ description: 'Notification preferences object' })
  @IsOptional()
  @IsObject()
  notificationPreferences?: Record<string, unknown>;

  @ApiPropertyOptional({ description: 'School logo URL' })
  @IsOptional()
  @IsUrl()
  schoolLogoUrl?: string;
}
