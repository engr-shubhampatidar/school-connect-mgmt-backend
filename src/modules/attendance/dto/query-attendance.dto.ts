import { IsOptional, IsString, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GetAttendanceQueryDto {
  @ApiProperty({
    description: 'Class UUID',
    example: 'a1b2c3d4-e5f6-7a8b-9c0d-111213141516',
  })
  @IsString()
  classId: string;

  @ApiProperty({ description: 'Date in YYYY-MM-DD', example: '2025-12-17' })
  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'date must be YYYY-MM-DD' })
  date: string;
}

export class ClassHistoryQueryDto {
  @ApiPropertyOptional({
    description: 'Start date (YYYY-MM-DD)',
    example: '2025-12-01',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'from must be YYYY-MM-DD' })
  from?: string;

  @ApiPropertyOptional({
    description: 'End date (YYYY-MM-DD)',
    example: '2025-12-31',
  })
  @IsOptional()
  @Matches(/^\d{4}-\d{2}-\d{2}$/, { message: 'to must be YYYY-MM-DD' })
  to?: string;
}
