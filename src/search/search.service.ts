import { Injectable } from '@nestjs/common';

import axios from 'axios';
import { SEARCH_URL, getHeaders } from '../const';

export type ResSearchSuggest = {
  authors?: Array<string>;
  books?: Array<string>;
};

export interface SearchBookData {
  datas?: Datas;
  encodeKw?: string;
  isFromHuayu?: number;
  keyword?: string;
  pageNo?: number;
  recDataList?: RecDataList[];
  sort?: string;
  [property: string]: any;
}

export interface Datas {
  aroundNum: number;
  list: List[];
  pageNo: number;
  pageSize: number;
  scrollPageNums: number[];
  total: number;
  totalPage: number;
  [property: string]: any;
}

export interface List {
  authorId: number;
  authorization: number;
  authorName: string;
  bookId: number;
  cateFineId: number;
  cateFineName: string;
  cateId: number;
  catePid: number;
  catePName: string;
  chapterId: number;
  chapterName: string;
  consumeType: number;
  coverUrl: string;
  cpId: number;
  cpName: string;
  description: string;
  keyword: string;
  level: number;
  name: string;
  serialStatus: number;
  tomeId: number;
  tomeName: string;
  totalWord: number;
  updateTime: string;
  [property: string]: any;
}

export interface RecDataList {
  authorId: number;
  authorName: string;
  beginTime: string;
  bookId: number;
  bookName: string;
  cateFineId: number;
  cateFineName: string;
  cateId: number;
  cateName: string;
  catePid: number;
  catePname: string;
  createTime: string;
  description: string;
  endTime: string;
  extraInfo: string;
  extraInfoJsonMap: null;
  id: number;
  imageUrl: string;
  issueTime: string;
  level: number;
  linkUrl: string;
  position: number;
  recReason: string;
  serialStatus: number;
  summary: string;
  title: string;
  titleColor: string;
  totalWord: number;
  typeId: number;
  uniqCharId: string;
  updateTime: string;
  [property: string]: any;
}

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
  ): Promise<SearchBookData> => {
    const url = SEARCH_URL.replace('{keyword}', encodeURIComponent(keyword))
      .replace('{pageNo}', pageNo.toString())
      .replace('{pageNum}', pageNum.toString());
    try {
      const response = await axios.get(url, { headers: getHeaders() });

      return response?.data?.data || {};
    } catch (error) {
      console.error('Error searching books:', error);
      return {};
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
