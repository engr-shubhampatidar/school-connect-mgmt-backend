import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayUnique,
  IsArray,
  IsEmail,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { ClassSubjectAssignmentDto } from './class-subject-assignment.dto';

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

  @ApiPropertyOptional({ type: 'array', items: { type: 'string' } })
  @IsOptional()
  @IsArray()
  @ArrayUnique()
  subjects?: string[];

  @ApiPropertyOptional({
    description:
      'Class ID to set this teacher as the class teacher (homeroom teacher)',
    type: 'string',
    format: 'uuid',
  })
  @IsOptional()
  @IsUUID()
  classTeacher?: string;

  @ApiPropertyOptional({
    description:
      'Assign teacher to class-subject combinations. Use subjectId null for class teacher assignments.',
    type: [ClassSubjectAssignmentDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClassSubjectAssignmentDto)
  assignClassSubjects?: ClassSubjectAssignmentDto[];
}
