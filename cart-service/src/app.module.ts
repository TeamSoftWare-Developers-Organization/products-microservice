import { Module } from '@nestjs/common';
import { CartModule } from './cart.module';

@Module({
  imports: [CartModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
