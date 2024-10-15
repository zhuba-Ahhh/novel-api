import { Controller, Get, Query } from '@nestjs/common';
import { CategoryService } from './category.service';

@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  /**
   * 获取章节内容接口
   * @param url - 章节URL
   */
  @Get('') // 修改为 POST 请求
  async getCategory(@Query('bookType') bookType: string) {
    const data = await this.categoryService.getCategory(bookType);
    return { code: 1, data }; // 封装返回格式
  }
}
