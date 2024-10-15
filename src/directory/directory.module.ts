import { Module } from '@nestjs/common';
import { DirectoryService } from './directory.service';
import { DirectoryController } from './directory.controller';

@Module({
  controllers: [DirectoryController],
  providers: [DirectoryService],
})
export class DirectoryModule {}
