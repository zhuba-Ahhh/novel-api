import { Controller, Get, Query } from '@nestjs/common';
import { SearchService } from './search.service';

@Controller('search')
export class SearchController {
  constructor(private readonly searchService: SearchService) {}

  /**
   * 搜索小说接口
   * @param keyword - 搜索关键词
   * @param pageNo - 页码
   * @param pageNum - 每页数量
   */
  @Get('')
  async search(
    @Query('keyword') keyword: string,
    @Query('pageNo') pageNo: number = 1,
    @Query('pageNum') pageNum: number = 20,
  ) {
    const data = await this.searchService.searchBook(keyword, pageNo, pageNum);
    return { code: 1, data }; // 封装返回格式
  }

  @Get('suggest')
  async suggest(@Query('keyword') keyword: string) {
    const data = await this.searchService.searchSuggest(keyword);
    return { code: 1, data }; // 封装返回格式
  }
}
