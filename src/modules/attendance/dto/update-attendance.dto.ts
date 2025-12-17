import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { AttendanceStudentStatus } from '../entities/attendance-student.entity';

export class UpdateAttendanceStudentDto {
  @ApiPropertyOptional({ example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479' })
  @IsString()
  studentId: string;

  @ApiPropertyOptional({
    enum: AttendanceStudentStatus,
    example: AttendanceStudentStatus.ABSENT,
  })
  @IsEnum(AttendanceStudentStatus)
  status: AttendanceStudentStatus;
}

export class UpdateAttendanceDto {
  @ApiPropertyOptional({
    example: '2025-12-18',
    description: 'Optional new date in YYYY-MM-DD',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  date?: string;

  @ApiPropertyOptional({
    type: [UpdateAttendanceStudentDto],
    example: [
      { studentId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', status: 'ABSENT' },
    ],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateAttendanceStudentDto)
  students?: UpdateAttendanceStudentDto[];
}
