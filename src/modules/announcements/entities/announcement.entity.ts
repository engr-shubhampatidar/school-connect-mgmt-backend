import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

@Entity({ name: 'announcements' })
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ description: 'Announcement title' })
  @Column()
  title: string;

  @ApiProperty({ description: 'Announcement message' })
  @Column('text')
  message: string;

  @ApiPropertyOptional({
    description: 'Target class id (null = school-level)',
    type: 'string',
  })
  @Column({ nullable: true }) // null = school-level
  targetClassId: string;

  @ApiProperty({ description: 'Owning school id', type: 'string' })
  @Column()
  schoolId: string;

  @ApiPropertyOptional({
    description: 'Optional attachments',
    type: 'array',
    items: {
      type: 'object',
      properties: { filename: { type: 'string' }, url: { type: 'string' } },
    },
  })
  @Column({ type: 'json', nullable: true })
  attachments?: Array<{ filename: string; url: string }>;

  @ApiProperty({ description: 'Creator user id', type: 'string' })
  @Column()
  createdByUserId: string;

  @ApiProperty({ description: 'Creation timestamp' })
  @CreateDateColumn()
  createdAt: Date;
}
