import { Injectable } from '@nestjs/common';

import axios from 'axios';
import { load } from 'cheerio';
import { DIRECTORY_URL, DirectoryRes, getHeaders } from '../const';

@Injectable()
export class DirectoryService {
  /**
   * 获取章节目录
   * @param bookId - 小说ID
   * @returns 章节列表
   */
  getDirectory = async (bookId: number): Promise<DirectoryRes> => {
    const url = DIRECTORY_URL.replace('{bookId}', bookId.toString());
    try {
      const response = await axios.get(url, { headers: getHeaders() });
      const $ = load(response.data);
      const ulElement = $('body div.volume-list ul.chapter-list');
      const liElements = ulElement.find('li');
      const chapterList: DirectoryRes['chapterList'] = liElements
        ?.map((_, element) => ({
          name: $(element).find('a').text(),
          url: $(element).find('a').attr('href'),
        }))
        .get();

      const volumeElement = $('div.volume-list');
      const volumeList: DirectoryRes['volumeList'] = [];

      volumeElement.find('> div').map((index, element) => {
        // 提取分卷信息
        const volumeElement = $(element).find('.volume');
        // 获取所有的子节点，包括文本节点
        const fullText = volumeElement.text().trim(); // 获取全部文本内容
        // 按换行符分割，获取第二行
        const name = fullText.split('\n')?.[1]?.split('共')?.[0].trim() || '';
        const chapterCount = volumeElement
          ?.find('.count')
          ?.text()
          ?.match(/共(\d+)/)[1];

        const totalWords = volumeElement.find('cite').text().trim();
        const volume = { name, chapterCount, totalWords };

        const ulElement = $(element).find('ul.chapter-list');
        const liElements = ulElement.find('li');
        const chapters = liElements
          ?.map((_, element) => ({
            name: $(element).find('a').text(),
            url: $(element).find('a').attr('href'),
          }))
          .get();

        volumeList.push({ volume, chapters });
      });

      const metaElement = $('body div.book-meta');
      const info = {
        title: '',
        author: '',
        latestChapter: '',
        latestChapterUrl: '',
        updateTime: '',
        path: [],
      };
      info.title = $(metaElement).find('h1').text().trim();
      info.author = $(metaElement).find('a').text().trim();
      info.updateTime = $(metaElement).find('span').eq(1).text().trim();
      info.latestChapter = $(metaElement).find('span').eq(2).text().trim();
      info.latestChapterUrl = chapterList[chapterList.length - 1].url;
      info.path = $('div.crumb > a')
        .map((_, element) => $(element).text().trim().replace(/>/g, ''))
        .get();

      return { chapterList, volumeList, info };
    } catch (error) {
      console.error('Error getting directory:', error);
      return {
        chapterList: [],
        volumeList: [],
        info: {
          title: '',
          author: '',
          latestChapter: '',
          latestChapterUrl: '',
          updateTime: '',
          path: [],
        },
      };
    }
  };
}
