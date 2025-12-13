import {
  IsString,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsObject,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAnnouncementDto {
  @ApiProperty({ description: 'Announcement title' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Announcement message' })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    description: "Audience string: 'all' or 'class:<id>'",
  })
  @IsString()
  @IsOptional()
  // audience can be 'all' or 'class:<id>' — we validate class id in service
  audience?: string;

  @ApiPropertyOptional({
    description: 'Optional attachments array',
    type: 'array',
    items: {
      type: 'object',
      properties: { filename: { type: 'string' }, url: { type: 'string' } },
    },
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsObject({ each: true })
  attachments?: Array<{ filename: string; url: string }>;
}
