import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChapterModule } from './chapter/chapter.module';
import { DirectoryModule } from './directory/directory.module';
import { SearchModule } from './search/search.module';
import { CategoryModule } from './category/category.module';

@Module({
  imports: [ChapterModule, DirectoryModule, SearchModule, CategoryModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
