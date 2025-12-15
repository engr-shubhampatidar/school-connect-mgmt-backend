import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  JoinColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { ClassEntity } from '../../classes/entities/class.entity';
import { School } from '../../schools/entities/school.entity';

@Entity({ name: 'attendance' })
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ClassEntity)
  class: ClassEntity;

  @ManyToOne(() => Student)
  student: Student;

  @ManyToOne(() => School, { nullable: false, onDelete: 'CASCADE' })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar' })
  status: 'present' | 'absent' | 'late';

  @Column()
  markedByUserId: string;

  @CreateDateColumn()
  createdAt: Date;
}
