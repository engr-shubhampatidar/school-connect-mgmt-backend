import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  CreateDateColumn,
  UpdateDateColumn,
  Unique,
  Index,
} from 'typeorm';
import { AttendanceStudent } from './attendance-student.entity';

export enum AttendanceStatus {
  MARKED = 'MARKED',
}

@Entity({ name: 'attendances' })
@Unique(['schoolId', 'classId', 'date'])
@Index('attendance_school_class_date_idx', ['schoolId', 'classId', 'date'])
export class Attendance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  schoolId: string;

  @Column()
  classId: string;

  @Column({ type: 'date' })
  date: string;

  @Column()
  markedBy: string;

  @Column({
    type: 'enum',
    enum: AttendanceStatus,
    default: AttendanceStatus.MARKED,
  })
  status: AttendanceStatus;

  @OneToMany(() => AttendanceStudent, (s) => s.attendance, { cascade: true })
  students: AttendanceStudent[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
