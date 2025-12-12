import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import ormConfig from './config/typeorm.config';
import { ConfigModule } from '@nestjs/config';
import { PublicModule } from './modules/public/public.module';
import { AdminModule } from './modules/admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot(ormConfig),
    PublicModule,
    AdminModule,
  ],
})
export class AppModule {}
