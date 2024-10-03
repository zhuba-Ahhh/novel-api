import { Controller, Get, Query, Post, Body } from '@nestjs/common';
import { NovelService } from './novel.service';

@Controller('novel')
export class NovelController {
  constructor(private readonly novelService: NovelService) {}

  /**
   * 搜索小说接口
   * @param keyword - 搜索关键词
   * @param pageNo - 页码
   * @param pageNum - 每页数量
   */
  @Get('search')
  async search(
    @Query('keyword') keyword: string,
    @Query('pageNo') pageNo: number = 1,
    @Query('pageNum') pageNum: number = 20,
  ) {
    const data = await this.novelService.searchBook(keyword, pageNo, pageNum);
    return { code: 1, data }; // 封装返回格式
  }
  /**
   * 获取章节目录接口
   * @param bookId - 小说ID
   */
  @Get('directory')
  async getDirectory(@Query('id') id: number) {
    const data = await this.novelService.getDirectory(id);
    return { code: 1, data }; // 封装返回格式
  }

  /**
   * 获取章节内容接口
   * @param url - 章节URL
   */
  @Post('chapter') // 修改为 POST 请求
  async getChapterContent(@Body('url') url: string) {
    const data = await this.novelService.getChapterContent(url);
    return { code: 1, data }; // 封装返回格式
  }
}
