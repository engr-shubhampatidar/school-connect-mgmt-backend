import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { School } from '../../schools/entities/school.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  code?: string;

  @Column({ type: 'timestamp', nullable: true })
  deletedAt?: Date | null;

  @ManyToOne(() => School, (s) => s.subjects)
  @JoinColumn()
  school: School;
}
