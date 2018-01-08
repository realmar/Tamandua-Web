import { ApiResponse } from './api-response';

export interface SearchRow {
  [index: string]: string | number | Array<string | number>;
}

export interface SearchResponse extends ApiResponse {
  total_rows: number;
  rows: Array<SearchRow>;
}
