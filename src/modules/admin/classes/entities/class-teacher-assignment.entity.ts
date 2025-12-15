import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  Column,
  Unique,
} from 'typeorm';
import { ClassEntity } from '../../../classes/entities/class.entity';
import { TeacherProfile } from '../../entities/teacher-profile.entity';
import { Subject } from '../../entities/subject.entity';
import { School } from '../../../schools/entities/school.entity';

@Entity('class_teacher_assignments')
@Unique(['classId', 'teacherId', 'subjectId'])
export class ClassTeacherAssignment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ClassEntity, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'classId' })
  classEntity: ClassEntity;

  @Column()
  classId: string;

  @ManyToOne(() => TeacherProfile, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'teacherId' })
  teacher?: TeacherProfile | null;

  @Column({ nullable: true })
  teacherId?: string | null;

  @ManyToOne(() => Subject, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'subjectId' })
  subject?: Subject | null;

  @Column({ nullable: true })
  subjectId?: string | null;

  @ManyToOne(() => School, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column()
  schoolId: string;
}
