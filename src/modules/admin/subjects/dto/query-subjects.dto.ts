import { IsOptional, IsString } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QuerySubjectsDto {
  @ApiPropertyOptional({
    description: 'Search term to filter subjects by name',
  })
  @IsOptional()
  @IsString()
  search?: string;
}
