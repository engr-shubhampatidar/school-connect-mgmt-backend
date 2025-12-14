import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  ManyToMany,
} from 'typeorm';
import { School } from '../../schools/entities/school.entity';
import { Student } from '../../students/entities/student.entity';
import { TeacherProfile } from '../../admin/entities/teacher-profile.entity';

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

  @ManyToMany(() => TeacherProfile, (t) => t.classes)
  teachers?: TeacherProfile[];
}
