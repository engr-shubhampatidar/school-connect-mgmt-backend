import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity({ name: 'announcements' })
export class Announcement {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  message: string;

  @Column({ nullable: true }) // null = school-level
  targetClassId: string;

  @Column()
  schoolId: string;

  @Column({ type: 'json', nullable: true })
  attachments?: Array<{ filename: string; url: string }>;

  @Column()
  createdByUserId: string;

  @CreateDateColumn()
  createdAt: Date;
}
