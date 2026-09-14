import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { User } from './users/user.entity';
import { AuthModule } from './auth/auth.module';
import { AdminSeederService } from './users/admin-seeder.service';
import { UsersController } from './users/users.controller';
import { AdminGuard } from './users/admin.guard';
import { JwtModule } from '@nestjs/jwt';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: 5432,
      username: process.env.DATABASE_USER || 'postgres',
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME || 'auth_db',
      entities: [User],
      synchronize: true, // Auto create tables (dev only)
    }),
    TypeOrmModule.forFeature([User]),
    JwtModule.register({ secret: process.env.JWT_SECRET || 'dev-secret' }),
    AuthModule,
  ],
  controllers: [AppController, UsersController],
  providers: [AppService, AdminSeederService, AdminGuard],
})
export class AppModule { }
