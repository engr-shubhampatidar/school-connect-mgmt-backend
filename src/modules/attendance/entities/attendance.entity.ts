import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
} from 'typeorm';
import { Student } from '../../students/entities/student.entity';
import { ClassEntity } from '../../classes/entities/class.entity';

@Entity({ name: 'attendance' })
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ClassEntity)
  class: ClassEntity;

  @ManyToOne(() => Student)
  student: Student;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar' })
  status: 'present' | 'absent' | 'late';

  @Column()
  markedByUserId: string;

  @CreateDateColumn()
  createdAt: Date;
}
