// src/modules/public/public.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Contact } from '../contact/entities/contact.entity';
import { School } from '../schools/entities/school.entity';
import { User } from '../users/entities/user.entity';
import { PublicController } from './public.controller';
import { PublicService } from './public.service';
import { ClassEntity } from '../classes/entities/class.entity';
import { Student } from '../students/entities/student.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([School, User, Contact, ClassEntity, Student]),
  ],
  controllers: [PublicController],
  providers: [PublicService],
})
export class PublicModule {}
