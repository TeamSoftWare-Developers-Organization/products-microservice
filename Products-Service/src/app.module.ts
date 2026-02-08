// src/app.module.ts

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config'; // استيراد حزمة الإعدادات
import { ProductsModule } from './Products/products.module'; // تأكد من استيراد وحدة المنتجات

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
      
      useFactory: (config: ConfigService) => ({
        
        type: 'postgres',
        // استخدام متغيرات البيئة المحددة في docker-compose.yml:
        host: config.get<string>('DATABASE_HOST'), // postgres
        // console.log(`[DB CONNECT DEBUG] Attempting connection with User: ${dbUser}`);
        port: 5432,
        username: config.get<string>('DATABASE_USER'), // postgres
        password: config.get<string>('DATABASE_PASSWORD'), // password
        database: config.get<string>('DATABASE_NAME'), // products_db

        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // يبقى true للتطوير
      }),
    }),
    
    ProductsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
