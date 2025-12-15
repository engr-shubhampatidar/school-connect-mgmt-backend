import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { School } from '../../schools/entities/school.entity';

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

  // Class and subject membership is now represented via ClassTeacherAssignment
}
