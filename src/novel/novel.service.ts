import { Injectable } from '@nestjs/common';

import axios from 'axios';
import { load } from 'cheerio';

// 纵横中文网官网地址
const BASE_URL = 'https://book.zongheng.com';
const BASE_URL1 = 'https://read.zongheng.com';
// 搜索的地址
const SEARCH_URL =
  'https://search.zongheng.com/search/book?keyword={keyword}&sort=null&pageNo={pageNo}&pageNum={pageNum}&isFromHuayu=0';
// 获取目录的地址
const DIRECTORY_URL = 'https://book.zongheng.com/showchapter/{bookId}.html';
// 获取封面图片的地址
const COVER_BASE_URL = 'http://static.zongheng.com/upload/';

// 定义返回类型
export interface ChapterRes {
  name: string;
  title: string;
  content: string;
  category: string;
  path: string[];
  author?: string;
  wordCount?: string;
  updateTime?: string;
  preUrl?: string;
  nextUrl?: string;
}

export interface DirectoryRes {
  info: {
    title: string;
    author: string;
    latestChapter: string;
    latestChapterUrl: string;
    updateTime: string;
    path: string[];
  };
  chapterList: Array<{
    name: string;
    url: string;
  }>;
  volumeList: Array<{
    volume: {
      name: string;
      chapterCount: string;
      totalWords: string;
    };
    chapters: {
      name: string;
      url: string;
    }[];
  }>;
}

const getHeaders = () => ({
  accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
  'accept-encoding': 'gzip, deflate, br',
  'accept-language': 'zh,zh-CN;q=0.9,en;q=0.8',
  'cache-control': 'no-cache',
  cookie:
    'ZHID=2058A443F3F560E74A1DA05CAFB3B5FA; ver=2018; zh_visitTime=1665159625988; sajssdk_2015_cross_new_user=1; loginphone=13819760929; logon=NTQzNDA1NzE%3D%7CMA%3D%3D%7C%7C5Lmm5Y%2BLNjAzODMwMTQ%3D%7CdHJ1ZQ%3D%3D%7CLTM5NzA1MzU5NQ%3D%3D%7CB79BF945930B761F722AAB75F2E7EBE7; __logon__=NTQzNDA1NzE%3D%7CMA%3D%3D%7C%7C5Lmm5Y%2BLNjAzODMwMTQ%3D%7CdHJ1ZQ%3D%3D%7CLTM5NzA1MzU5NQ%3D%3D%7CB79BF945930B761F722AAB75F2E7EBE7; __zhs__=42d335a4aa125667cde89e1625111fafbc415bd289ea8b8220cbd228230312d7df3b8608287ddd8cc4c4481b3801efedde085c0d194316ac914c9c9c96a3f7a68edfac199be9c9ae170f3e27886aef9c6f7bab6b19fa16cdfef3b0f199fcc5aa32c0a1985e6f306ae2107b49cb73d02c1b54149547fa74c4b9cd84d605844965; __zhc__=30819f300d06092a864886f70d010101050003818d003081890281810096169a3b6e961507d9763a615436e49f4564bfa6ab8c577626236c959c3cd95657ef4f70f37f6a5b7320e472a1f104f343ca5dec28ec05777aa950a84d93f5530a18ddd82908735ef2ef0ee3abaf94197a7f78f30e3a4c7d83a6c408d6214665aeb567ffd5f2d36f29ddb04d22b4250b731dd00277ce37e6eb6fc987c512e8df0203010001; PassportCaptchaId=edf79c48ad1f3256759f69333a647c81; rSet=1_3_1_14_1; zhffr=www.baidu.com; sensorsdata2015jssdkcross=%7B%22distinct_id%22%3A%22183b33f7d2994e-054fd224b8debd-26021f51-1131564-183b33f7d2ad73%22%2C%22%24device_id%22%3A%22183b33f7d2994e-054fd224b8debd-26021f51-1131564-183b33f7d2ad73%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E8%87%AA%E7%84%B6%E6%90%9C%E7%B4%A2%E6%B5%81%E9%87%8F%22%2C%22%24latest_referrer%22%3A%22https%3A%2F%2Fwww.baidu.com%2Flink%22%2C%22%24latest_referrer_host%22%3A%22www.baidu.com%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC%22%7D%7D; Hm_lvt_c202865d524849216eea846069349eb9=1665159626,1665203758,1665211989; JSESSIONID=abcBdrT_eGwWUdDWPx2oy; Hm_lpvt_c202865d524849216eea846069349eb9=1665212011',
  pragma: 'no-cache',
  referer: BASE_URL,
  'sec-ch-ua':
    '"Chromium";v="106", "Google Chrome";v="106", "Not;A=Brand";v="99"',
  'sec-ch-ua-mobile': '?0',
  'sec-ch-ua-platform': 'Windows',
  'sec-fetch-dest': 'document',
  'sec-fetch-mode': 'navigate',
  'sec-fetch-site': 'cross-site',
  'sec-fetch-user': '?1',
  'upgrade-insecure-requests': '1',
  'user-agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/106.0.0.0 Safari/537.36',
});

@Injectable()
export class NovelService {
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
      const preUrl =
        BASE_URL1 + (btns.find('a').attr('href') || '').replace(/\?$/, '');
      const nextUrl =
        BASE_URL1 +
        (btns.find('a').eq(2).attr('href') || '').replace(/\?$/, '');

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
