import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { School } from '../../schools/entities/school.entity';
import { Student } from '../../students/entities/student.entity';

@Entity({ name: 'classes' })
export class ClassEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string; // "Grade 5"

  @Column({ nullable: true })
  section: string; // "A"

  @ManyToOne(() => School, (s) => s.classes)
  school: School;

  @OneToMany(() => Student, (s) => s.class)
  students: Student[];
}
