import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { School } from '../../../schools/entities/school.entity';

@Entity('subjects')
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @ManyToOne(() => School, (s) => s.id)
  school: School;
}
