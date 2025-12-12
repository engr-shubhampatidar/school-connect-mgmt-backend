import { School } from 'src/modules/schools/entities/school.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from 'typeorm';

@Entity({ name: 'contacts' })
export class Contact {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone?: string;

  @Column('text', { nullable: true })
  message?: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => School, (s) => s.contacts)
  school: School;
}
