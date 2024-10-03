import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NovelModule } from './novel/novel.module';

@Module({
  imports: [NovelModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
