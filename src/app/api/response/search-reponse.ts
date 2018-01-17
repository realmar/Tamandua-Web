import { ApiResponse } from './api-response';

export type SearchRowValue = string | number | Array<string | number>;

export interface SearchRow {
  [index: string]: SearchRowValue;
}

// export type SearchRow = Map<string, string | number | Array<string | number>>;

export interface SearchResponse extends ApiResponse {
  total_rows: number;
  rows: Array<SearchRow>;
}
