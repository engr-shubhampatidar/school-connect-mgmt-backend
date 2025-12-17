import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  Unique,
} from 'typeorm';
import { Attendance } from './attendance.entity';

export enum AttendanceStudentStatus {
  PRESENT = 'PRESENT',
  ABSENT = 'ABSENT',
}

@Entity({ name: 'attendance_students' })
@Unique(['attendanceId', 'studentId'])
export class AttendanceStudent {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Attendance, (a) => a.students, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attendanceId' })
  attendance: Attendance;

  @Column()
  attendanceId: string;

  @Column()
  studentId: string;

  @Column({ type: 'enum', enum: AttendanceStudentStatus })
  status: AttendanceStudentStatus;

  @CreateDateColumn()
  createdAt: Date;
}
