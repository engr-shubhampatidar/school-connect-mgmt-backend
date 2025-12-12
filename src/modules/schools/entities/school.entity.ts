import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Contact } from '../../contact/entities/contact.entity';
import { ClassEntity } from '../../classes/entities/class.entity';
import { Subject } from '../../admin/entities/subject.entity';

@Entity('schools')
export class School {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  contact: string;

  @Column({ nullable: true })
  logoUrl: string;

  @Column({ nullable: true })
  academicYear?: string;

  @Column({ nullable: true })
  timezone?: string;

  @Column({ type: 'json', nullable: true })
  notificationPreferences?: Record<string, unknown>;

  @Column({ default: 'active' })
  provisioningStatus: string;

  @OneToMany(() => User, (u) => u.school)
  users: User[];

  @OneToMany(() => Contact, (c) => c.school)
  contacts: Contact[];

  @OneToMany(() => ClassEntity, (cl) => cl.school)
  classes: ClassEntity[];

  @OneToMany(() => Subject, (subj) => subj.school)
  subjects: Subject[];
}
