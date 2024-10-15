import { Controller, Get, Query } from '@nestjs/common';
import { DirectoryService } from './directory.service';

@Controller('directory')
export class DirectoryController {
  constructor(private readonly directoryService: DirectoryService) {}

  /**
   * 获取章节目录接口
   * @param bookId - 小说ID
   */
  @Get('')
  async getDirectory(@Query('id') id: number) {
    const data = await this.directoryService.getDirectory(id);
    return { code: 1, data }; // 封装返回格式
  }
}
