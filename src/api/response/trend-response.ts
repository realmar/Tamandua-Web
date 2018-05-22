import { ApiResponse } from './api-response';

interface TrendItem {
  datetime: string;
  key: string;
  value: string;
}

export interface TrendResponse extends ApiResponse, Array<Array<TrendItem>> {
}
