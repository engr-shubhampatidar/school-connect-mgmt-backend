import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { School } from '../../schools/entities/school.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  fullName: string;

  @Column({ unique: true })
  email: string;

  @Column()
  passwordHash: string;

  @Column({ default: 'admin' })
  role: string;

  @ManyToOne(() => School, (s) => s.users, { onDelete: 'CASCADE' })
  school: School;
}
