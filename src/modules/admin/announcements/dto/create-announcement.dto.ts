import {
  IsString,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  IsObject,
} from 'class-validator';

export class CreateAnnouncementDto {
  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsString()
  @IsOptional()
  // audience can be 'all' or 'class:<id>' — we validate class id in service
  audience?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsObject({ each: true })
  attachments?: Array<{ filename: string; url: string }>;
}
