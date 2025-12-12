import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { User } from '../../../users/entities/user.entity';
import { School } from '../../../schools/entities/school.entity';
import { ClassEntity } from '../../../classes/entities/class.entity';
import { Subject } from '../../entities/subject.entity';

@Entity('teacher_profiles')
export class TeacherProfile {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  @JoinColumn()
  user: User;

  @ManyToOne(() => School, (s) => s.id)
  school: School;

  @Column({ nullable: true })
  phone?: string;

  @ManyToMany(() => ClassEntity, { eager: true })
  @JoinTable({ name: 'teacher_classes' })
  classes?: ClassEntity[];

  @ManyToMany(() => Subject, { eager: true })
  @JoinTable({ name: 'teacher_subjects' })
  subjects?: Subject[];
}
