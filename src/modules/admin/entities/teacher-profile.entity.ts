import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { School } from '../../schools/entities/school.entity';
import { Subject } from './subject.entity';

@Entity('teacher_profiles')
export class TeacherProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.id, { eager: true })
  @JoinColumn()
  user: User;

  @ManyToOne(() => School, (s) => s.id)
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  phone?: string;

  // Teacher specialties (subjects) are stored via a many-to-many join table.
  @ManyToMany(() => Subject, { cascade: false })
  @JoinTable({
    name: 'teacher_subjects',
    joinColumn: { name: 'teacherId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'subjectId', referencedColumnName: 'id' },
  })
  subjects?: Subject[];

  // Class membership and per-class subject assignments are represented via ClassTeacherAssignment
}
