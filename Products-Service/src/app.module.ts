// src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; // استيراد حزمة الإعدادات
import { ProductsModule } from './Products/products.module'; // تأكد من استيراد وحدة المنتجات
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    // 1. إعداد وحدة الإعدادات (ConfigModule)
    ConfigModule.forRoot({
      isGlobal: true, // لجعل المتغيرات متاحة في كل مكان
      // يمكنك هنا تحديد ملف .env محلي إذا كنت بحاجة إليه للاختبار
    }),

    // 2. إعداد اتصال TypeORM باستخدام ConfigService
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (config: ConfigService) => {
        const host = config.get<string>('DATABASE_HOST');
        const user = config.get<string>('DATABASE_USER');
        const db = config.get<string>('DATABASE_NAME');
        console.log(`[DB DEBUG] Connecting to Host: ${host}, User: ${user}, DB: ${db}`);

        return {
          type: 'postgres',
          host: host,
          port: 5432,
          username: user,
          password: config.get<string>('DATABASE_PASSWORD'),
          database: db,
          entities: [__dirname + '/**/*.entity{.ts,.js}'],
          synchronize: true,
          logging: true, // Enable TypeORM logging
        };
      },
    }),

    ProductsModule,
    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
