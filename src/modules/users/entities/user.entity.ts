import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { School } from '../../schools/entities/school.entity';

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  STAFF = 'staff',
  TEACHER = 'teacher',
  STUDENT = 'student',
}

@Index('users_school_email_idx', ['schoolId', 'email'], { unique: true })
@Index('users_school_role_idx', ['schoolId', 'role'])
@Index('users_role_idx', ['role'])
@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fullName?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  email?: string | null;

  @Column({ type: 'varchar', length: 255, nullable: true })
  passwordHash?: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  phone?: string | null;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.ADMIN })
  role: UserRole;

  @ManyToOne(() => School, (s) => s.users, {
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'schoolId' })
  school: School;

  @Column({ nullable: true })
  schoolId?: string | null;

  @Column({ default: false })
  emailVerified: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastLogin: Date | null;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
