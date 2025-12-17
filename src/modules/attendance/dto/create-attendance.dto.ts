import {
  IsArray,
  IsEnum,
  IsNotEmpty,
  IsString,
  ValidateNested,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { AttendanceStudentStatus } from '../entities/attendance-student.entity';

export class AttendanceStudentDto {
  @ApiProperty({
    example: 'f47ac10b-58cc-4372-a567-0e02b2c3d479',
    description: 'Student UUID',
  })
  @IsString()
  @IsNotEmpty()
  studentId: string;

  @ApiProperty({
    enum: AttendanceStudentStatus,
    example: AttendanceStudentStatus.PRESENT,
  })
  @IsEnum(AttendanceStudentStatus)
  status: AttendanceStudentStatus;
}

export class CreateAttendanceDto {
  @ApiProperty({
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-111213141516',
    description: 'Class UUID',
  })
  @IsString()
  @IsNotEmpty()
  classId: string;

  @ApiProperty({
    example: '2025-12-17',
    description: 'Attendance date in YYYY-MM-DD',
  })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  date: string;

  @ApiProperty({
    type: [AttendanceStudentDto],
    description: 'Array of student attendance statuses',
    example: [
      { studentId: 'f47ac10b-58cc-4372-a567-0e02b2c3d479', status: 'PRESENT' },
    ],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttendanceStudentDto)
  students: AttendanceStudentDto[];
}
