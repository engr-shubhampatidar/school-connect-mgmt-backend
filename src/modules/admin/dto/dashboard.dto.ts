import { ApiProperty } from '@nestjs/swagger';
import { StudentSummaryDto } from './student-summary.dto';

export class DashboardDto {
  @ApiProperty({ format: 'uuid' })
  schoolId: string;

  @ApiProperty({ type: 'number' })
  totalStudents: number;

  @ApiProperty({ type: 'number' })
  totalClasses: number;

  @ApiProperty({ type: 'number' })
  totalTeachers: number;

  @ApiProperty({ type: () => StudentSummaryDto, isArray: true })
  recentStudents: StudentSummaryDto[];
}
