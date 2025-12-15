import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
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
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @OneToMany(() => Student, (s) => s.currentClass)
  students: Student[];

  // Teachers for a class are represented via ClassTeacherAssignment
}
