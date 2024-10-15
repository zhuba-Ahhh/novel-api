import { Injectable } from '@nestjs/common';

import axios from 'axios';
import { SEARCH_URL, getHeaders, COVER_BASE_URL } from '../const';

export type ResSearchSuggest = {
  authors?: Array<string>;
  books?: Array<string>;
};

@Injectable()
export class SearchService {
  /**
   * 搜索小说
   * @param keyword - 搜索关键词
   * @param pageNo - 页码
   * @param pageNum - 每页数量
   * @returns 搜索结果列表
   */
  searchBook = async (
    keyword: string,
    pageNo: number = 1,
    pageNum: number = 20,
  ): Promise<unknown> => {
    const url = SEARCH_URL.replace('{keyword}', encodeURIComponent(keyword))
      .replace('{pageNo}', pageNo.toString())
      .replace('{pageNum}', pageNum.toString());
    try {
      const response = await axios.get(url, { headers: getHeaders() });
      const books = response?.data?.data?.datas?.list || [];
      return books.map((book) => ({
        ...book,
        id: book.bookId,
        name: book.name,
        author: book.authorName,
        cover: COVER_BASE_URL + book.coverUrl,
        description: book.description,
        words: book.totalWord,
      }));
    } catch (error) {
      console.error('Error searching books:', error);
      return [];
    }
  };
  /**
   * @param 搜索建议
   * @param keyword
   * @returns
   */
  searchSuggest = async (keyword = ''): Promise<ResSearchSuggest> => {
    const url = `https://search.zongheng.com/search/suggest${keyword ? '?keyword=' + keyword : ''}`;
    try {
      const response: any = await axios.get(url, {
        headers: getHeaders(),
      });

      return response?.data?.data || {};
    } catch (error) {
      console.error('Error searching books:', error);
      return {};
    }
  };
}
