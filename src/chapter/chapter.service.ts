import { Injectable } from '@nestjs/common';

import axios from 'axios';
import { load } from 'cheerio';
import { BASE_URL1, ChapterRes, getHeaders } from '../const';

@Injectable()
export class ChapterService {
  labelMap = {
    作者: 'author',
    更新时间: 'updateTime',
    本章字数: 'wordCount',
  };

  /**
   * 获取某一章节的内容
   * @param url - 章节URL
   * @returns 章节标题、内容、更新时间、作者、本章字数、更新时间、书名和类别
   */
  getChapterContent = async (url: string): Promise<ChapterRes> => {
    try {
      const response = await axios.get(url, { headers: getHeaders() });
      const $ = load(response.data);
      const title = $('div.title_txtbox').text().trim();
      const content = $('div.content').html() || '';

      const bookInfo = $('.bookinfo span')
        .map((_, element) => {
          const $element = $(element);
          const infoLabel = $element.find('i').text().trim();
          return {
            label: $element.text().trim().replace(/：/, ':'),
            value:
              $element.find('a').length > 0
                ? $element.find('a').attr('href')
                : infoLabel,
          };
        })
        .get();

      const bookInfoObj = bookInfo.reduce(
        (acc, curr) => {
          const [label, value] = curr.label.split(':');
          const englishLabel = this.labelMap[label.trim()] || label.trim(); // 使用映射对象转换键名，如果没有映射则使用原键名
          acc[englishLabel] = value.trim();
          return acc;
        },
        {} as Record<string, string>,
      );

      const path = $('.reader-crumb > a')
        .map((_, element) => $(element).text().trim())
        .get();
      const name = $('.reader-crumb').contents().last().text().trim();
      const category = $('.reader-crumb a').eq(2).text().trim();

      const btns = $('div.nav-btn-group');
      // 去除尾部的？
      let preUrl = (btns.find('a').attr('href') || '').replace(/\?$/, '');
      if (!isScript(preUrl)) {
        preUrl = BASE_URL1 + preUrl;
      } else {
        preUrl = '';
      }

      let nextUrl = (btns.find('a').eq(2).attr('href') || '').replace(
        /\?$/,
        '',
      );
      if (!isScript(nextUrl)) {
        nextUrl = BASE_URL1 + nextUrl;
      } else {
        nextUrl = '';
      }

      return {
        name,
        title,
        path,
        category,
        ...bookInfoObj,
        preUrl,
        nextUrl,
        content,
      };
    } catch (error) {
      console.error('Error getting chapter content:', error);
      return {
        name: '',
        title: '',
        path: [],
        category: '',
        author: '',
        wordCount: '',
        updateTime: '',
        content: '',
      };
    }
  };
}

const isScript = (str: string) => str == 'javascript:;';
