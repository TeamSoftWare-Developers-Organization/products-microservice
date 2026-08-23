import './tracing';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);



  app.use((req, res, next) => {
    console.log(`[AuthService Global Logger] ${req.method} ${req.url}`);
    next();
  });

  await app.listen(process.env.PORT ?? 3001);
}
bootstrap();
