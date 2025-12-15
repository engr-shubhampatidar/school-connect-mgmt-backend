import {
  IsEmail,
  IsOptional,
  IsString,
  IsArray,
  ArrayUnique,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
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
