import { ApiProperty } from '@nestjs/swagger';

export class StudentSummaryDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: 'string', format: 'date-time' })
  createdAt: Date;
}
