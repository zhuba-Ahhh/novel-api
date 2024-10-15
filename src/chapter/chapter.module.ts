import { Module } from '@nestjs/common';
import { ChapterService } from './chapter.service';
import { ChapterController } from './chapter.controller';

@Module({
  controllers: [ChapterController],
  providers: [ChapterService],
})
export class ChapterModule {}
