import { Injectable } from '@nestjs/common';

import axios from 'axios';
import { getHeaders } from '../const';

@Injectable()
export class CategoryService {
  getCategory = async (bookType = '0'): Promise<any> => {
    const url = `https://www.zongheng.com/api2/catefine/storeSearchConf?bookType=${bookType}`;
    try {
      const response: any = await axios.get(url, {
        headers: getHeaders(),
      });

      return response?.data?.result || {};
    } catch (error) {
      console.error('Error searching books:', error);
      return {};
    }
  };
}
