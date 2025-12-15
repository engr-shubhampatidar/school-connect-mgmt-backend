import {
  IsEmail,
  IsOptional,
  IsString,
  IsArray,
  ArrayUnique,
  IsUUID,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeacherDto {
  @ApiProperty({ example: 'teacher@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'Ms. Jane Doe' })
  @IsString()
  fullName: string;

  @ApiPropertyOptional({ example: '+1-555-0100' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    type: 'array',
    items: { type: 'string', format: 'uuid' },
  })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  @IsUUID('4', { each: true })
  assignClassIds?: string[];

  @ApiPropertyOptional({ type: 'array', items: { type: 'string' } })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  subjects?: string[];

  @ApiPropertyOptional({
    description:
      'Optional class id to assign this teacher as the class teacher',
  })
  @IsOptional()
  @IsUUID()
  classId?: string;
}
