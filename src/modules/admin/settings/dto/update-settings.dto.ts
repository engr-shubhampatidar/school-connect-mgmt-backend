import { IsOptional, IsString, IsObject, IsUrl } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsString()
  academicYear?: string;

  @IsOptional()
  @IsString()
  timezone?: string;

  @IsOptional()
  @IsObject()
  notificationPreferences?: Record<string, unknown>;

  @IsOptional()
  @IsUrl()
  schoolLogoUrl?: string;
}
