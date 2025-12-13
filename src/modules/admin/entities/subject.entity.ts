import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { School } from '../../schools/entities/school.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ description: 'Subject name' })
  @Column()
  name: string;

  @ApiPropertyOptional({ description: 'Optional subject code' })
  @Column({ nullable: true })
  code?: string;

  @ApiPropertyOptional({ description: 'Soft-delete timestamp' })
  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date | null;

  @ApiProperty({ type: () => School, description: 'Owning school' })
  @ManyToOne(() => School, (s) => s.subjects)
  @JoinColumn()
  school: School;
}
