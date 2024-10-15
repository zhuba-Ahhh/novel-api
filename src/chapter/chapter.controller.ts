import { Controller, Get, Query } from '@nestjs/common';
import { ChapterService } from './chapter.service';

@Controller('chapter')
export class ChapterController {
  constructor(private readonly chapterService: ChapterService) {}

  /**
   * 获取章节内容接口
   * @param url - 章节URL
   */
  @Get('') // 修改为 POST 请求
  async getChapterContent(
    @Query('id') id: string,
    @Query('chapterId') chapterId: string,
  ) {
    const url = `https://read.zongheng.com/chapter/${id}/${chapterId}.html`;
    const data = await this.chapterService.getChapterContent(url);
    return { code: 1, data }; // 封装返回格式
  }
}
