import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
  RelationId,
} from 'typeorm';
import { ClassEntity } from '../../classes/entities/class.entity';
import { School } from '../../schools/entities/school.entity';

@Entity({ name: 'students' })
export class Student {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  rollNo: string;

  @ManyToOne(() => ClassEntity, (c) => c.students, {
    nullable: false,
    onDelete: 'RESTRICT',
  })
  @JoinColumn({ name: 'classId' })
  currentClass: ClassEntity;

  @RelationId((student: Student) => student.currentClass)
  classId: string;

  @ManyToOne(() => School, { nullable: false, onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @RelationId((student: Student) => student.school)
  schoolId: string;

  @Column({ nullable: true })
  photoUrl: string;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'date', nullable: true })
  enrollmentDate?: Date;
}
