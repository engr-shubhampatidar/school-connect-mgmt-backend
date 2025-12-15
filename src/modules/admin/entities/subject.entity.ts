import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  DeleteDateColumn,
} from 'typeorm';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { School } from '../../schools/entities/school.entity';

@Index(['schoolId', 'code'], { unique: true })
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
  @Index('IDX_subject_deletedAt')
  @DeleteDateColumn({ name: 'deletedAt', type: 'timestamptz', nullable: true })
  deletedAt?: Date | null;

  @ApiProperty({ description: 'Owning school id' })
  @Index('IDX_subject_schoolId')
  @Column()
  schoolId: string;

  @ApiProperty({ type: () => School, description: 'Owning school' })
  @ManyToOne(() => School, (s) => s.subjects)
  @JoinColumn({ name: 'schoolId' })
  school: School;
}
